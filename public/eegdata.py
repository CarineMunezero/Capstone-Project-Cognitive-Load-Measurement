import sys
import time
import json
import numpy as np
import threading

import pyqtgraph as pg
from pyqtgraph.Qt import QtCore, QtWidgets

import matplotlib.pyplot as plt
from scipy.signal import butter, filtfilt, welch
from pylsl import StreamInlet, resolve_byprop

# ------------------------------------------
# Firebase Admin Initialization
# ------------------------------------------
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin with your service account key
cred = credentials.Certificate(
    r"C:\Users\hiyan\OneDrive - Gannon University\Desktop\Firebase\public\firebasekey.json"
)
firebase_admin.initialize_app(cred)
db = firestore.client()

# ------------------------------------------
# Define frequency bands for EEG analysis
BANDS = {
    "Delta": (0.5, 4),
    "Theta": (4, 8),
    "Alpha": (8, 13),
    "Beta":  (13, 30),
    "Gamma": (30, 100)
}

def bandpass_filter(data, fs, low, high, order=4):
    """Apply a Butterworth bandpass filter using filtfilt."""
    nyq = 0.5 * fs
    lowcut = low / nyq
    highcut = high / nyq
    b, a = butter(order, [lowcut, highcut], btype='band')
    return filtfilt(b, a, data)

# ------------------------------------------
# EEG Data Collector class using LSL
# ------------------------------------------
class EEGCollector:
    """
    Collects raw EEG data from LSL in a background thread.
    Maintains:
      - A ring buffer for real-time display (last 5 seconds by default)
      - A full data list for offline analysis.
    """
    def __init__(self, buffer_duration=5.0):
        print("Looking for an EEG stream...")
        streams = resolve_byprop('type', 'EEG', timeout=5)
        if not streams:
            print("No EEG stream found.")
            sys.exit(1)

        self.inlet = StreamInlet(streams[0])
        info = self.inlet.info()
        self.fs = int(info.nominal_srate()) if info.nominal_srate() > 0 else 500
        self.ch_count = info.channel_count()

        print(f"Connected to EEG stream with {self.ch_count} channels.")
        print(f"Sampling Rate ~ {self.fs} Hz.")
        print("Close the window to finalize analysis.\n")

        self.buffer_duration = buffer_duration
        self.start_time = time.time()
        self.ring_buffer = []  # list of [time, ch1, ch2, ...]
        self.all_data = []     # full raw data
        self.all_timestamps = []

        self.running = True
        self.thread = None

    def start(self):
        """Spawn background thread to collect data."""
        if self.thread is None:
            self.thread = threading.Thread(target=self.collect_data, daemon=True)
            self.thread.start()

    def collect_data(self):
        """Continuously pull samples into ring_buffer and all_data."""
        while self.running:
            sample, tstamp = self.inlet.pull_sample()
            if sample is not None and tstamp is not None:
                self.all_data.append(sample)
                self.all_timestamps.append(tstamp)

                # Add sample to ring buffer
                rel_time = tstamp - self.inlet.time_correction()
                row = [rel_time] + sample
                self.ring_buffer.append(row)

                # Remove old data from ring buffer
                cutoff = (time.time() - self.start_time) - self.buffer_duration
                while self.ring_buffer and (self.ring_buffer[0][0] < cutoff):
                    self.ring_buffer.pop(0)
            time.sleep(0.001)

    def stop(self):
        """Stop data collection."""
        self.running = False
        if self.thread is not None:
            self.thread.join(timeout=2)
            self.thread = None
        print("Data collection stopped.")

    def get_ring_buffer(self):
        """Return ring buffer as (times, channels)."""
        if not self.ring_buffer:
            return None, None
        arr = np.array(self.ring_buffer, dtype=float)
        times = arr[:, 0]
        channels = arr[:, 1:].T  # shape: (ch_count, N)
        return times, channels

    def get_all_data(self):
        """Return all collected data and timestamps."""
        arr = np.array(self.all_data, dtype=float)  # shape: (N, ch_count)
        ts = np.array(self.all_timestamps, dtype=float)
        return arr, ts, self.fs

# ------------------------------------------
# Real-time plotting class using PyQtGraph
# ------------------------------------------
class BandSubplots:
    """
    Creates a PyQtGraph window with a subplot for each EEG frequency band.
    Each subplot displays the amplitude (absolute value of the filtered signal)
    over the last ~2 seconds.
    """
    def __init__(self, collector, buffer_sec=5.0, user_id="test_user"):
        self.collector = collector
        self.fs = collector.fs
        self.band_names = list(BANDS.keys())
        self.n_bands = len(self.band_names)
        self.user_id = user_id

        # Create PyQtGraph window
        self.app = QtWidgets.QApplication(sys.argv)
        self.win = pg.GraphicsLayoutWidget(title="Real-Time EEG Bands (Subplots)")
        self.win.show()

        # Create one PlotItem per band
        self.plots = []
        self.curves = []
        self.colors = [(0, 0, 255), (0, 200, 0), (255, 0, 0), (255, 128, 0), (200, 0, 200)]
        for i, band in enumerate(self.band_names):
            p = self.win.addPlot(row=i, col=0, title=band)
            p.showGrid(x=True, y=True)
            c = p.plot(pen=pg.mkPen(color=self.colors[i % len(self.colors)], width=2))
            self.plots.append(p)
            self.curves.append(c)

        # Set up a timer for real-time updates (every 200 ms)
        self.timer = QtCore.QTimer()
        self.timer.timeout.connect(self.update_plot)
        self.timer.start(200)

        # When the window is closed, stop collection and perform final analysis
        def on_close(evt):
            collector.stop()
            all_data, all_ts, fs = collector.get_all_data()
            do_final_cog_analysis(all_data, fs, self.user_id)
            evt.accept()
            self.app.quit()

        self.win.closeEvent = on_close

    def run(self):
        sys.exit(self.app.exec_())

    def update_plot(self):
        times, channels = self.collector.get_ring_buffer()
        if times is None or len(times) < 2:
            return

        # Analyze the last ~2 seconds of data
        t_latest = times[-1]
        window_start = t_latest - 2.0
        idx = np.where(times >= window_start)[0]
        w_times = times[idx]
        w_ch = channels[:, idx]

        # Average across channels
        avg_eeg = np.mean(w_ch, axis=0)

        # For each frequency band, apply the bandpass filter and compute amplitude
        for i, (band, rng) in enumerate(BANDS.items()):
            low, high = rng
            if len(avg_eeg) < 4:
                continue
            filtered = bandpass_filter(avg_eeg, self.fs, low, high, order=4)
            amplitude = np.abs(filtered)
            # Use relative time for x-axis
            t0 = w_times[0]
            rel_t = w_times - t0
            self.curves[i].setData(rel_t, amplitude)

# ------------------------------------------
# Final Analysis and Single-Document Storage
# ------------------------------------------
def do_final_cog_analysis(all_samples, fs, user_id="test_user"):
    """
    Performs final analysis:
      - Computes PSD for each frequency band,
      - Classifies cognitive load,
      - Writes ALL raw data + final analysis to Firestore in one document.
    """
    if len(all_samples) < fs * 2:
        print("Not enough data (<2s) for final analysis.")
        return

    print("\n=== Final Cognitive Load Analysis ===")
    duration_s = len(all_samples) / fs
    print(f"Total samples: {len(all_samples)}, ~{duration_s:.1f}s recorded.")

    # Average channels across time for analysis
    eeg_mean = np.mean(all_samples, axis=1)

    def process_wave(sig, low, high):
        fdata = bandpass_filter(sig, fs, low, high, order=4)
        f, pxx = welch(fdata, fs=fs, nperseg=1024)
        return np.mean(pxx)

    delta = process_wave(eeg_mean, 0.5, 4)
    theta = process_wave(eeg_mean, 4, 8)
    alpha = process_wave(eeg_mean, 8, 13)
    beta  = process_wave(eeg_mean, 13, 30)
    gamma = process_wave(eeg_mean, 30, 100)

    print("===== Mean PSD per Band =====")
    print(f"Delta (0.5-4 Hz): {delta:.4f}")
    print(f"Theta (4-8 Hz):   {theta:.4f}")
    print(f"Alpha (8-13 Hz):  {alpha:.4f}")
    print(f"Beta (13-30 Hz):  {beta:.4f}")
    print(f"Gamma (30-100 Hz):{gamma:.4f}")

    # Simple cognitive load classification
    if (gamma > alpha) and (beta > theta):
        cog = "High Cognitive Load"
    elif beta > alpha:
        cog = "Medium Cognitive Load"
    else:
        cog = "Low Cognitive Load"
    print(f"\n** {cog} **")

    import time
    doc_id = f"{user_id}_{int(time.time())}"

    # Convert the raw samples (2D list) to a JSON string to avoid nested arrays
    raw_data_json = json.dumps(all_samples.tolist())
    try:
        db.collection("eeg_data").document(doc_id).set({
            "user_id": user_id,
            "raw_eeg_samples": raw_data_json,  # Stored as a JSON string
            "fs": fs,
            "delta": delta,
            "theta": theta,
            "alpha": alpha,
            "beta": beta,
            "gamma": gamma,
            "cognitive_load": cog,
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        print("Final data + cognitive load saved to Firestore in one document.")
    except Exception as e:
        print("Error saving final data:", e)

# ------------------------------------------
# Main function to run the application
# ------------------------------------------
def main():
    user_id = "test_user"  # Replace with actual user or session ID as needed
    collector = EEGCollector(buffer_duration=5.0)
    collector.start()

    # Create and run the real-time plotting app with subplots for each band
    band_app = BandSubplots(collector, buffer_sec=5.0, user_id=user_id)
    band_app.run()

if __name__ == "__main__":
    main()
