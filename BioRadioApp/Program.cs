using GLNeuroTech.Devices.BioRadio;
using GLNeuroTech.Devices.BioRadio.Configuration;
using System;

class Program
{
    static void Main()
    {
        // The MAC address of your BioRadio device
        string _macId = "ECFE7E13509E";
        long macAddressLong = ConvertMacAddressToLong(_macId);

        // Step 1: Create an Android transport provider.
        AndroidTransportProvider trans = new AndroidTransportProvider();

        // Step 2: Create a BioRadio device manager.
        BioRadioDeviceManager mgr = new BioRadioDeviceManager();

        // Step 3: Create a device using the MAC address and display the device info.
        BioRadioDevice _device;
        using (_device = mgr.GetBluetoothDevice(macAddressLong))
        {
            // Display battery and device time info
            BatteryInfo battery = _device.GetBatteryInfo();
            Console.WriteLine("Voltage: " + battery.Voltage.ToString());
            DateTime deviceTime = _device.GetDeviceTime();
            Console.WriteLine("Current Device Time: " + deviceTime.ToString());

            // Update device date and time if necessary
            if (deviceTime < DateTime.Now.AddSeconds(-5) || deviceTime > DateTime.Now.AddSeconds(5))
            {
                _device.SetDeviceTime();
                deviceTime = _device.GetDeviceTime();
                Console.WriteLine("New Device Time: " + deviceTime.ToString());
            }

            // Start acquisition
            Console.WriteLine("Starting acquisition...");
            _device.StartAcquisition();
            Console.WriteLine("Acquisition Started...");
        }

        // Start acquisition and display the scaled values for 20 seconds.
        Console.WriteLine("Feel free to press a BioRadio button");
        DateTime endTime = DateTime.Now.AddSeconds(20);
        bool continueLoop = true;
        while (DateTime.Now < endTime && continueLoop)
        {
            bool dataProcessed = false;

            // Log available signal groups and signals
            Console.WriteLine("Available Signal Groups:");
            foreach (var signalGroup in _device.SignalGroups)
            {
                Console.WriteLine($"Signal Group: {signalGroup.Name}");
                foreach (BioRadioSignal signal in signalGroup)
                {
                    Console.WriteLine($"Signal: {signal.Name}");
                    var samples = signal.GetScaledValueArray();

                    if (samples.Length > 0)  // Ensure there are samples to process
                    {
                        Console.WriteLine($"Received {samples.Length} samples from {signal.Name}.");
                        foreach (var val in samples)
                        {
                            Console.Write(val.ToString("##.####   "));
                        }
                        dataProcessed = true;
                    }
                    else
                    {
                        Console.WriteLine($"No data from {signal.Name} yet.");
                    }
                }
            }

            if (!dataProcessed)
            {
                Console.WriteLine("No data processed, breaking the loop...");
                break;  // Break out of the loop if no data is being processed
            }
        }

        // Stop acquisition and disconnect the device
        _device.StopAcquisition();
        Console.WriteLine("Acquisition Stopped.");
        _device.Disconnect();
    }

    // Implement the method to convert MAC address to long
    private static long ConvertMacAddressToLong(string macId)
    {
        // Ensure the MAC address is in upper case and remove any colons or other non-numeric characters
        macId = macId.Replace(":", "").ToUpper();

        // Check if the length of the string is 12 (valid MAC address length)
        if (macId.Length != 12)
        {
            throw new ArgumentException("Invalid MAC address format. It should be 12 hex characters.");
        }

        // Convert the MAC address from hex string to long
        try
        {
            return long.Parse(macId, System.Globalization.NumberStyles.HexNumber);
        }
        catch (FormatException)
        {
            throw new ArgumentException("Invalid MAC address format. The address must be a valid hexadecimal string.");
        }
    }
}

internal class AndroidTransportProvider
{
    public AndroidTransportProvider()
    {
    }
}