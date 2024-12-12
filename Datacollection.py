import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
from scipy import signal
import mne

# File path to your EEG data (replace with your actual file path)
file_path = 'eeg_data.txt'  # Update with the correct path to your data file

# Load data
print("Loading data...")
data = pd.read_csv(file_path, delimiter='\t', header=None)  # Assuming tab-separated values

# Convert to NumPy array and transpose to match MNE format
data_np = data.to_numpy().T

# Define parameters
sfreq = 128  # Update based on BioRadio's sampling frequency
n_channels = data_np.shape[0]
ch_names = [f'EEG {i+1}' for i in range(n_channels)]
ch_types = ['eeg'] * n_channels

# Create MNE Info object and RawArray
info = mne.create_info(ch_names=ch_names, sfreq=sfreq, ch_types=ch_types)
raw = mne.io.RawArray(data_np, info)

# Bandpass filter
print("Applying bandpass filter...")
raw.filter(1, 50, fir_design='firwin')

# Downsample the data
print("Downsampling data...")
raw.resample(sfreq // 2)

# Convert MNE RawArray to Pandas DataFrame for further processing
eeg_data = pd.DataFrame(data=raw.get_data().T, columns=ch_names)
eeg_data['time_seconds'] = np.arange(len(eeg_data)) / raw.info['sfreq']

# Raw signal plotting for specific channels
selected_channels = ['EEG 1', 'EEG 2', 'EEG 3', 'EEG 4']  # Replace with actual F1, F2, O1, O2 mapping
print("Plotting raw signals...")
plt.figure(figsize=(12, 8))
for channel in selected_channels:
    plt.plot(eeg_data['time_seconds'], eeg_data[channel], label=channel)
plt.title('Raw Signal: Amplitude vs. Time')
plt.xlabel('Time (s)')
plt.ylabel('Amplitude (uV)')
plt.legend()
plt.show()

# Power Spectral Density (PSD) plotting
print("Calculating and plotting PSD...")
plt.figure(figsize=(12, 8))
for channel in selected_channels:
    psd, freqs = signal.welch(eeg_data[channel], fs=sfreq // 2, nperseg=256)
    plt.plot(freqs, psd, label=channel)
plt.title('Power Spectral Density (PSD)')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Power (uV^2/Hz)')
plt.xlim(0, 50)
plt.legend()
plt.show()

# Band power analysis
print("Performing band power analysis...")
band_limits = {
    'Theta': (4, 8),
    'Alpha': (8, 13),
    'Beta': (13, 30),
    'Gamma': (30, 50)
}

band_powers = {band: [] for band in band_limits}
for channel in selected_channels:
    psd, freqs = signal.welch(eeg_data[channel], fs=sfreq // 2, nperseg=256)
    for band, (low, high) in band_limits.items():
        idx_band = np.logical_and(freqs >= low, freqs <= high)
        band_powers[band].append(np.mean(freqs[idx_band]))

# Plot band power comparisons
print("Plotting band power comparisons...")
x = np.arange(len(selected_channels))
width = 0.2
plt.figure(figsize=(12, 8))
for i, (band, powers) in enumerate(band_powers.items()):
    plt.bar(x + i * width, powers, width, label=band)
plt.xticks(x + width, selected_channels)
plt.xlabel('Channels')
plt.ylabel('Frequency (Hz)')
plt.title('Band Frequency Comparison')
plt.legend()
plt.show()

# Spectrogram plotting
print("Plotting spectrograms...")
ncols = 2
nrows = int(np.ceil(len(selected_channels) / ncols))
fig, axs = plt.subplots(nrows=nrows, ncols=ncols, figsize=(12, 6 * nrows),
                        constrained_layout=True, sharex=True, sharey=True)

vmin, vmax = -10, 30
for i, channel in enumerate(selected_channels):
    row, col = divmod(i, ncols)
    ax = axs[row, col] if nrows > 1 else axs[col]

    frequencies, times, spectrogram = signal.spectrogram(
        eeg_data[channel], fs=sfreq // 2, nperseg=128, noverlap=64, nfft=128
    )

    im = ax.pcolormesh(
        times, frequencies, 10 * np.log10(spectrogram),
        shading='nearest', cmap='viridis', vmin=vmin, vmax=vmax
    )
    ax.set_title(channel)
    ax.set_ylim(0, 50)
    ax.set_ylabel('Frequency (Hz)')

fig.supxlabel('Time (s)')
fig.supylabel('Frequency (Hz)')
fig.colorbar(im, ax=axs, orientation='vertical', shrink=0.9, label='Power (dB/Hz)')
plt.show()
