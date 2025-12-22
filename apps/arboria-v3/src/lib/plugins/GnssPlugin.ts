import { registerPlugin } from '@capacitor/core';

export interface GnssMeasurementEvent {
    clock: {
        timeNanos: number;
        fullBiasNanos?: number;
        biasNanos?: number;
        driftNanosPerSecond?: number;
    };
    measurements: {
        svid: number;
        constellationType: number;
        cn0DbHz: number;
        accumulatedDeltaRangeMeters?: number;
        accumulatedDeltaRangeState?: number;
        carrierFrequencyHz?: number;
        state: number;
        receivedSvTimeNanos: number;
    }[];
}

export interface SmoothedLocation {
    latitude: number;
    longitude: number;
    accuracy: number;
    provider: string; // 'hatch_filter'
}

export interface GnssPlugin {
    start(): Promise<void>;
    stop(): Promise<void>;
    addListener(eventName: 'gnss_measurement', listenerFunc: (event: GnssMeasurementEvent) => void): Promise<import('@capacitor/core').PluginListenerHandle> & import('@capacitor/core').PluginListenerHandle;
    addListener(eventName: 'smoothed_location', listenerFunc: (event: SmoothedLocation) => void): Promise<import('@capacitor/core').PluginListenerHandle> & import('@capacitor/core').PluginListenerHandle;
}

const Gnss = registerPlugin<GnssPlugin>('Gnss');

export default Gnss;
