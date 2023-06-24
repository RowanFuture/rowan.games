AudioWorkletProcessor.prototype.makeMortal = function() {
    this.keepAlive = true;
    this.port.onmessage = (_msg) => {
        if (_msg.data === "kill")
            this.keepAlive = false;
    };
};

class AudioBusInput extends AudioWorkletProcessor
{
    static get parameterDescriptors() 
    {
        return [
            { name: "bypass", automationRate: "a-rate", defaultValue: 0, minValue: 0, maxValue: 1 }
        ];
    }

    constructor()
    {
        super();
        this.makeMortal();
    }

    process(inputs, outputs, parameters) 
    {
        // 1 input and 2 outputs
        // 1st output is written to when not bypassed
        // 2nd output is written to when bypassed
        const input = inputs[0];
        const bypass = parameters.bypass;

        for (let c = 0; c < input.length; ++c)
        {
            const inputChannel = input[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                outputs[b][c][s] = inputChannel[s];
            }
        }

        return this.keepAlive;
    }
}

class AudioBusOutput extends AudioWorkletProcessor
{
    static get parameterDescriptors() 
    {
        return [
            { name: "gain", automationRate: "a-rate", defaultValue: 1, minValue: 0 }
        ];
    }

    constructor()
    {
        super();
        this.makeMortal();
    }

    process(inputs, outputs, parameters) 
    {
        // 2 inputs and 1 output
        // 1st input is from the effect chain
        // 2nd input is from the bypass
        const input0 = inputs[0];
        const input1 = inputs[1];
        const output = outputs[0];

        const gain = parameters.gain;

        // Copy the bypassed audio to the output
        for (let c = 0; c < input1.length; ++c)
        {
            const inputChannel = input1[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s)
                outputChannel[s] = inputChannel[s];
        }

        // Then mix in the affected audio with a gain scalar
        for (let c = 0; c < input0.length; ++c)
        {
            const inputChannel = input0[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                const g = (gain[s] !== undefined) ? gain[s] : gain[0];

                outputChannel[s] += inputChannel[s] * g;
            }
        }

        return this.keepAlive;
    }
}

registerProcessor("audio-bus-input", AudioBusInput);
registerProcessor("audio-bus-output", AudioBusOutput);

class BitcrusherProcessor extends AudioWorkletProcessor
{
    static get parameterDescriptors() 
    {
        return [
            { name: "bypass",     automationRate: "a-rate", defaultValue: 0,   minValue: 0,   maxValue: 1 },
            { name: "gain",       automationRate: "a-rate", defaultValue: 1.0, minValue: 0.0 },
            { name: "factor",     automationRate: "a-rate", defaultValue: 20,  minValue: 1,   maxValue: 100 },
            { name: "resolution", automationRate: "a-rate", defaultValue: 8,   minValue: 2,   maxValue: 16  },
            { name: "mix",        automationRate: "a-rate", defaultValue: 0.8, minValue: 0.0, maxValue: 1.0 }
        ];
    }

    static scalars = [
        undefined,
        undefined,
        2,
        4,
        8,
        16,
        32,
        64,
        128,
        256,
        512,
        1024,
        2048,
        4096,
        8192,
        16384,
        32768
    ];

    constructor(_options)
    {
        super();
        this.makeMortal();

        const maxChannels = _options.outputChannelCount[0];

        this.sample = new Float32Array(maxChannels);
        this.hold = new Uint32Array(maxChannels);
    }

    process(inputs, outputs, parameters) 
    {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const gain = parameters.gain;
        const factor = parameters.factor;
        const resolution = parameters.resolution;
        const mix = parameters.mix;

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                // Copy the input to the output
                outputChannel[s] = inputChannel[s];

                // Update held sample
                if (this.hold[c] === 0)
                    this.sample[c] = inputChannel[s];

                // Update hold counter
                const f = (factor[s] !== undefined) ? factor[s] : factor[0];

                ++this.hold[c];
                this.hold[c] %= f;

                // Check bypass state
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                if (b > 0.0) {
                    continue;
                }

                // Get the held sample
                let val = this.sample[c];

                // Apply gain and hard clip
                const g = (gain[s] !== undefined) ? gain[s] : gain[0];

                val *= g;
                val = Math.max(Math.min(val, 1.0), -1.0);

                // Resolution reduction
                const r = (resolution[s] !== undefined) ? resolution[s] : resolution[0];
                const max = (val > 0.0) ? BitcrusherProcessor.scalars[r] - 1 : BitcrusherProcessor.scalars[r];

                val = Math.round(val * max) / max;

                // Mix the distorted and original samples
                const m = (mix[s] !== undefined) ? mix[s] : mix[0];

                outputChannel[s] *= (1.0 - m);
                outputChannel[s] += (val * m);
            }
        }

        return this.keepAlive;
    }
}

registerProcessor("bitcrusher-processor", BitcrusherProcessor);

class DelayProcessor extends AudioWorkletProcessor
{
    static MAX_DELAY_TIME = 5.0; // seconds

    static get parameterDescriptors() 
    {
        return [
            { name: "bypass",   automationRate: "a-rate", defaultValue: 0,    minValue: 0,   maxValue: 1 },
            { name: "time",     automationRate: "a-rate", defaultValue: 0.2,  minValue: 0.0, maxValue: DelayProcessor.MAX_DELAY_TIME },
            { name: "feedback", automationRate: "a-rate", defaultValue: 0.5,  minValue: 0.0, maxValue: 1.0 },
            { name: "mix",      automationRate: "a-rate", defaultValue: 0.35, minValue: 0.0, maxValue: 1.0 }
        ];
    }

    constructor(_options)
    {
        super();
        this.makeMortal();

        const maxChannels = _options.outputChannelCount[0];

        const delayLineLength = (DelayProcessor.MAX_DELAY_TIME * sampleRate) + 1;

        this.buffer = new Array(maxChannels);
        this.writeIndex = new Uint32Array(maxChannels);

        for (let c = 0; c < maxChannels; ++c)
            this.buffer[c] = new Float32Array(delayLineLength);
    }

    process(inputs, outputs, parameters) 
    {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const time = parameters.time;
        const feedback = parameters.feedback;
        const mix = parameters.mix;

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                // Copy the input to the output
                outputChannel[s] = inputChannel[s];

                // Read a sample from the delay line
                const t = (time[s] !== undefined) ? time[s] : time[0];

                const delayOut = this.read(c, t);

                // Write a sample (with feedback) to the delay line
                const f = (feedback[s] !== undefined) ? feedback[s] : feedback[0];

                const delayIn = inputChannel[s] + (delayOut * f);
                this.write(c, delayIn);

                // Check bypass state
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                if (b > 0.0) {
                    continue;
                }

                // Mix the delayed and original samples
                const m = (mix[s] !== undefined) ? mix[s] : mix[0];
                
                outputChannel[s] *= (1 - m);
                outputChannel[s] += (delayOut * m);
            }
        }

        return this.keepAlive;
    }

    read(_channel, _time)
    {
        const delayInFrames = _time * sampleRate;

        let index1 = (this.writeIndex[_channel] - ~~delayInFrames);
        let index2 = (index1 - 1);
    
        while (index1 < 0)
            index1 += this.buffer[_channel].length;
    
        while (index2 < 0)
            index2 += this.buffer[_channel].length;
    
        const frac = delayInFrames - ~~delayInFrames;
    
        const samp1 = this.buffer[_channel][index1];
        const samp2 = this.buffer[_channel][index2];
    
        return samp1 + (samp2 - samp1) * frac;
    }

    write(_channel, _sample)
    {
        ++this.writeIndex[_channel];
        this.writeIndex[_channel] %= this.buffer[_channel].length;
        
        this.buffer[_channel][this.writeIndex[_channel]] = _sample;
    }
}

registerProcessor("delay-processor", DelayProcessor);

class EQInput extends AudioWorkletProcessor
{
    static get parameterDescriptors() {
        return [];
    }

    constructor() {
        super();
        this.makeMortal();
    }

    process(_inputs, _outputs, _parameters) {
        const input = _inputs[0];
        const output0 = _outputs[0];
        const output1 = _outputs[1];

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const output0Channel = output0[c];
            const output1Channel = output1[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                output0Channel[s] = inputChannel[s];
                output1Channel[s] = inputChannel[s];
            }
        }

        return this.keepAlive;
    }
}

class EQOutput extends AudioWorkletProcessor
{
    static get parameterDescriptors() {
        return [
            { name: "bypass", automationRate: "a-rate", defaultValue: 0, minValue: 0, maxValue: 1 }
        ];
    }

    constructor() {
        super();
        this.makeMortal();
    }

    process(_inputs, _outputs, _parameters) {
        const input0 = _inputs[0];
        const input1 = _inputs[1];
        const output = _outputs[0];

        const bypass = _parameters.bypass;

        for (let c = 0; c < input1.length; ++c) {
            const input0Channel = input0[c];
            const input1Channel = input1[c];
            const outputChannel = output[c];

            for (let s = 0; s < input0Channel.length; ++s) {
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                if (b > 0) {
                    outputChannel[s] = input1Channel[s];
                }
                else {
                    outputChannel[s] = input0Channel[s];
                }
            }
        }

        return this.keepAlive;
    }
}

registerProcessor("eq-input", EQInput);
registerProcessor("eq-output", EQOutput);

class GainProcessor extends AudioWorkletProcessor
{
    static get parameterDescriptors() 
    {
        return [
            { name: "bypass", automationRate: "a-rate", defaultValue: 0,   minValue: 0, maxValue: 1 },
            { name: "gain",   automationRate: "a-rate", defaultValue: 0.5, minValue: 0.0 }
        ];
    }

    constructor() 
    {
        super();
        this.makeMortal();
    }

    process(inputs, outputs, parameters) 
    {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const gain = parameters.gain;

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                // Copy the input to the output
                outputChannel[s] = inputChannel[s];

                // Check bypass state
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                if (b > 0.0) {
                    continue;
                }

                // Apply gain
                const g = (gain[s] !== undefined) ? gain[s] : gain[0];

                outputChannel[s] *= g;
            }
        }

        return this.keepAlive;
    }
}

registerProcessor("gain-processor", GainProcessor);

class HiShelfProcessor extends AudioWorkletProcessor
{
    static get parameterDescriptors() 
    {
        const maxFreq = Math.min(sampleRate / 2.0, 20000.0);

        return [
            { name: "bypass", automationRate: "a-rate", defaultValue: 0,                         minValue: 0,    maxValue: 1 },
            { name: "freq",   automationRate: "a-rate", defaultValue: Math.min(5000.0, maxFreq), minValue: 10.0, maxValue: maxFreq },
            { name: "q",      automationRate: "a-rate", defaultValue: 1.0,                       minValue: 1.0,  maxValue: 100.0 },
            { name: "gain",   automationRate: "a-rate", defaultValue: 1e-2,                      minValue: 1e-6 }
        ];
    }

    constructor(_options)
    {
        super();
        this.makeMortal();

        const maxChannels = _options.outputChannelCount[0];

        this.a1 = 0;
        this.a2 = 0;
        this.b0 = 0;
        this.b1 = 0;
        this.b2 = 0;

        this.x1 = new Float32Array(maxChannels);
        this.x2 = new Float32Array(maxChannels);
        this.y1 = new Float32Array(maxChannels);
        this.y2 = new Float32Array(maxChannels);

        this.prevFreq = -1;
        this.prevQ = -1;
        this.prevGain = -1;
    }

    process(inputs, outputs, parameters) 
    {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const freq = parameters.freq;
        const q = parameters.q;
        const gain = parameters.gain;

        const paramsAreConstant = (freq.length === 1 && q.length === 1 && gain.length === 1);

        if (paramsAreConstant)
            this.calcCoefficients(freq[0], q[0], gain[0]);

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                // Recalc coefficients if needed
                if (paramsAreConstant === false) {
                    const f = (freq[s] !== undefined) ? freq[s] : freq[0];
                    const qs = (q[s] !== undefined) ? q[s] : q[0];
                    const g = (gain[s] !== undefined) ? gain[s] : gain[0];

                    this.calcCoefficients(f, qs, g);
                }

                // Calculate the new sample
                const y0 = this.b0 * inputChannel[s]
                         + this.b1 * this.x1[c]
                         + this.b2 * this.x2[c]
                         - this.a1 * this.y1[c]
                         - this.a2 * this.y2[c];

                // Shift the original samples
                this.x2[c] = this.x1[c];
                this.x1[c] = inputChannel[s];
    
                // Shift the filtered samples
                this.y2[c] = this.y1[c];
                this.y1[c] = y0;

                // Write the original/filtered sample to the output
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                outputChannel[s] = (b > 0) ? inputChannel[s] : y0;
            }
        }

        return this.keepAlive;
    }

    calcCoefficients(_freq, _q, _gain)
    {
        if (_freq === this.prevFreq && _q === this.prevQ && _gain === this.prevGain)
            return;

        const w0 = 2 * Math.PI * _freq / sampleRate;
        const cos_w0 = Math.cos(w0);

        const A = Math.sqrt(_gain);
        const Ap1 = A + 1;
        const Am1 = A - 1;

        const Ap1_cos_w0 = Ap1 * cos_w0;
        const Am1_cos_w0 = Am1 * cos_w0;

        const Ap1_m_Am1_cos_w0 = Ap1 - Am1_cos_w0;
        const Ap1_p_Am1_cos_w0 = Ap1 + Am1_cos_w0;

        const alpha = Math.sin(w0) / (2 * _q);
        const _2_sqrt_A_alpha = (2 * Math.sqrt(A) * alpha);
    
        const a0 = Ap1_m_Am1_cos_w0 + _2_sqrt_A_alpha;
        const a1 = 2 * (Am1 - Ap1_cos_w0);
        const a2 = Ap1_m_Am1_cos_w0 - _2_sqrt_A_alpha;
    
        const b0 = A * (Ap1_p_Am1_cos_w0 + _2_sqrt_A_alpha);
        const b1 = -2 * A * (Am1 + Ap1_cos_w0);
        const b2 = A * (Ap1_p_Am1_cos_w0 - _2_sqrt_A_alpha);
    
        this.a1 = a1 / a0;
        this.a2 = a2 / a0;
        this.b0 = b0 / a0;
        this.b1 = b1 / a0;
        this.b2 = b2 / a0;

        this.prevFreq = _freq;
        this.prevQ = _q;
        this.prevGain = _gain;
    }
}

registerProcessor("hi-shelf-processor", HiShelfProcessor);

class HPF2Processor extends AudioWorkletProcessor
{
    static get parameterDescriptors() 
    {
        const maxCutoff = Math.min(sampleRate / 2.0, 20000.0);

        return [
            { name: "bypass", automationRate: "a-rate", defaultValue: 0,                           minValue: 0,    maxValue: 1 },
            { name: "cutoff", automationRate: "a-rate", defaultValue: Math.min(1500.0, maxCutoff), minValue: 10.0, maxValue: maxCutoff },
            { name: "q",      automationRate: "a-rate", defaultValue: 1.5,                         minValue: 1.0,  maxValue: 100.0 }
        ];
    }

    constructor(_options)
    {
        super();
        this.makeMortal();

        const maxChannels = _options.outputChannelCount[0];

        this.a1 = 0;
        this.a2 = 0;
        this.b0 = 0;
        this.b1 = 0;
        this.b2 = 0;

        this.x1 = new Float32Array(maxChannels);
        this.x2 = new Float32Array(maxChannels);
        this.y1 = new Float32Array(maxChannels);
        this.y2 = new Float32Array(maxChannels);

        this.prevCutoff = -1;
        this.prevQ = -1;
    }

    process(inputs, outputs, parameters) 
    {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const cutoff = parameters.cutoff;
        const q = parameters.q;

        const paramsAreConstant = (cutoff.length === 1 && q.length === 1);

        if (paramsAreConstant)
            this.calcCoefficients(cutoff[0], q[0]);

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                // Recalc coefficients if needed
                if (paramsAreConstant === false) {
                    const c = (cutoff[s] !== undefined) ? cutoff[s] : cutoff[0];
                    const qs = (q[s] !== undefined) ? q[s] : q[0];

                    this.calcCoefficients(c, qs);
                }

                // Calculate the new sample
                const y0 = this.b0 * inputChannel[s]
                         + this.b1 * this.x1[c]
                         + this.b2 * this.x2[c]
                         - this.a1 * this.y1[c]
                         - this.a2 * this.y2[c];

                // Shift the original samples
                this.x2[c] = this.x1[c];
                this.x1[c] = inputChannel[s];
    
                // Shift the filtered samples
                this.y2[c] = this.y1[c];
                this.y1[c] = y0;

                // Write the original/filtered sample to the output
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                outputChannel[s] = (b > 0) ? inputChannel[s] : y0;
            }
        }

        return this.keepAlive;
    }

    calcCoefficients(_cutoff, _q)
    {
        if (_cutoff === this.prevCutoff && _q === this.prevQ)
            return;

        const w0 = 2 * Math.PI * _cutoff / sampleRate;

        const alpha = Math.sin(w0) / (2 * _q);
        const cos_w0 = Math.cos(w0);
    
        const a0 = 1 + alpha;
        const a1 = -2 * cos_w0;
        const a2 = 1 - alpha;
    
        const b0 = (1 + cos_w0) / 2;
        const b1 = -1 - cos_w0;
        const b2 = (1 + cos_w0) / 2;
    
        this.a1 = a1 / a0;
        this.a2 = a2 / a0;
        this.b0 = b0 / a0;
        this.b1 = b1 / a0;
        this.b2 = b2 / a0;

        this.prevCutoff = _cutoff;
        this.prevQ = _q;
    }
}

registerProcessor("hpf2-processor", HPF2Processor);

class LoShelfProcessor extends AudioWorkletProcessor
{
    static get parameterDescriptors() 
    {
        const maxFreq = Math.min(sampleRate / 2.0, 20000.0);

        return [
            { name: "bypass", automationRate: "a-rate", defaultValue: 0,                         minValue: 0,    maxValue: 1 },
            { name: "freq",   automationRate: "a-rate", defaultValue: Math.min(500.0, maxFreq),  minValue: 10.0, maxValue: maxFreq },
            { name: "q",      automationRate: "a-rate", defaultValue: 1.0,                       minValue: 1.0,  maxValue: 100.0 },
            { name: "gain",   automationRate: "a-rate", defaultValue: 1e-2,                      minValue: 1e-6 }
        ];
    }

    constructor(_options)
    {
        super();
        this.makeMortal();

        const maxChannels = _options.outputChannelCount[0];

        this.a1 = 0;
        this.a2 = 0;
        this.b0 = 0;
        this.b1 = 0;
        this.b2 = 0;

        this.x1 = new Float32Array(maxChannels);
        this.x2 = new Float32Array(maxChannels);
        this.y1 = new Float32Array(maxChannels);
        this.y2 = new Float32Array(maxChannels);

        this.prevFreq = -1;
        this.prevQ = -1;
        this.prevGain = -1;
    }

    process(inputs, outputs, parameters) 
    {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const freq = parameters.freq;
        const q = parameters.q;
        const gain = parameters.gain;

        const paramsAreConstant = (freq.length === 1 && q.length === 1 && gain.length === 1);

        if (paramsAreConstant)
            this.calcCoefficients(freq[0], q[0], gain[0]);

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                // Recalc coefficients if needed
                if (paramsAreConstant === false) {
                    const f = (freq[s] !== undefined) ? freq[s] : freq[0];
                    const qs = (q[s] !== undefined) ? q[s] : q[0];
                    const g = (gain[s] !== undefined) ? gain[s] : gain[0];

                    this.calcCoefficients(f, qs, g);
                }

                // Calculate the new sample
                const y0 = this.b0 * inputChannel[s]
                         + this.b1 * this.x1[c]
                         + this.b2 * this.x2[c]
                         - this.a1 * this.y1[c]
                         - this.a2 * this.y2[c];

                // Shift the original samples
                this.x2[c] = this.x1[c];
                this.x1[c] = inputChannel[s];
    
                // Shift the filtered samples
                this.y2[c] = this.y1[c];
                this.y1[c] = y0;

                // Write the original/filtered sample to the output
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                outputChannel[s] = (b > 0) ? inputChannel[s] : y0;
            }
        }

        return this.keepAlive;
    }

    calcCoefficients(_freq, _q, _gain)
    {
        if (_freq === this.prevFreq && _q === this.prevQ && _gain === this.prevGain)
            return;

        const w0 = 2 * Math.PI * _freq / sampleRate;
        const cos_w0 = Math.cos(w0);

        const A = Math.sqrt(_gain);
        const Ap1 = A + 1;
        const Am1 = A - 1;

        const Ap1_cos_w0 = Ap1 * cos_w0;
        const Am1_cos_w0 = Am1 * cos_w0;

        const Ap1_m_Am1_cos_w0 = Ap1 - Am1_cos_w0;
        const Ap1_p_Am1_cos_w0 = Ap1 + Am1_cos_w0;

        const alpha = Math.sin(w0) / (2 * _q);
        const _2_sqrt_A_alpha = (2 * Math.sqrt(A) * alpha);
    
        const a0 = Ap1_p_Am1_cos_w0 + _2_sqrt_A_alpha;
        const a1 = -2 * (Am1 + Ap1_cos_w0);
        const a2 = Ap1_p_Am1_cos_w0 - _2_sqrt_A_alpha;
    
        const b0 = A * (Ap1_m_Am1_cos_w0 + _2_sqrt_A_alpha);
        const b1 = 2 * A * (Am1 - Ap1_cos_w0);
        const b2 = A * (Ap1_m_Am1_cos_w0 - _2_sqrt_A_alpha);
    
        this.a1 = a1 / a0;
        this.a2 = a2 / a0;
        this.b0 = b0 / a0;
        this.b1 = b1 / a0;
        this.b2 = b2 / a0;

        this.prevFreq = _freq;
        this.prevQ = _q;
        this.prevGain = _gain;
    }
}

registerProcessor("lo-shelf-processor", LoShelfProcessor);

class LPF2Processor extends AudioWorkletProcessor
{
    static get parameterDescriptors() 
    {
        const maxCutoff = Math.min(sampleRate / 2.0, 20000.0);

        return [
            { name: "bypass", automationRate: "a-rate", defaultValue: 0,                          minValue: 0,    maxValue: 1 },
            { name: "cutoff", automationRate: "a-rate", defaultValue: Math.min(500.0, maxCutoff), minValue: 10.0, maxValue: maxCutoff },
            { name: "q",      automationRate: "a-rate", defaultValue: 1.5,                        minValue: 1.0,  maxValue: 100.0 }
        ];
    }

    constructor(_options)
    {
        super();
        this.makeMortal();

        const maxChannels = _options.outputChannelCount[0];

        this.a1 = 0;
        this.a2 = 0;
        this.b0 = 0;
        this.b1 = 0;
        this.b2 = 0;

        this.x1 = new Float32Array(maxChannels);
        this.x2 = new Float32Array(maxChannels);
        this.y1 = new Float32Array(maxChannels);
        this.y2 = new Float32Array(maxChannels);

        this.prevCutoff = -1;
        this.prevQ = -1;
    }

    process(inputs, outputs, parameters) 
    {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const cutoff = parameters.cutoff;
        const q = parameters.q;

        const paramsAreConstant = (cutoff.length === 1 && q.length === 1);

        if (paramsAreConstant)
            this.calcCoefficients(cutoff[0], q[0]);

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                // Recalc coefficients if needed
                if (paramsAreConstant === false) {
                    const c = (cutoff[s] !== undefined) ? cutoff[s] : cutoff[0];
                    const qs = (q[s] !== undefined) ? q[s] : q[0];

                    this.calcCoefficients(c, qs);
                }

                // Calculate the new sample
                const y0 = this.b0 * inputChannel[s]
                         + this.b1 * this.x1[c]
                         + this.b2 * this.x2[c]
                         - this.a1 * this.y1[c]
                         - this.a2 * this.y2[c];

                // Shift the original samples
                this.x2[c] = this.x1[c];
                this.x1[c] = inputChannel[s];
    
                // Shift the filtered samples
                this.y2[c] = this.y1[c];
                this.y1[c] = y0;

                // Write the original/filtered sample to the output
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                outputChannel[s] = (b > 0) ? inputChannel[s] : y0;
            }
        }

        return this.keepAlive;
    }

    calcCoefficients(_cutoff, _q)
    {
        if (_cutoff === this.prevCutoff && _q === this.prevQ)
            return;

        const w0 = 2 * Math.PI * _cutoff / sampleRate;

        const alpha = Math.sin(w0) / (2 * _q);
        const cos_w0 = Math.cos(w0);
    
        const a0 = 1 + alpha;
        const a1 = -2 * cos_w0;
        const a2 = 1 - alpha;
    
        const b0 = (1 - cos_w0) / 2;
        const b1 = 1 - cos_w0;
        const b2 = (1 - cos_w0) / 2;
    
        this.a1 = a1 / a0;
        this.a2 = a2 / a0;
        this.b0 = b0 / a0;
        this.b1 = b1 / a0;
        this.b2 = b2 / a0;

        this.prevCutoff = _cutoff;
        this.prevQ = _q;
    }
}

registerProcessor("lpf2-processor", LPF2Processor);

class PeakEQProcessor extends AudioWorkletProcessor
{
    static get parameterDescriptors() 
    {
        const maxFreq = Math.min(sampleRate / 2.0, 20000.0);

        return [
            { name: "bypass", automationRate: "a-rate", defaultValue: 0,                         minValue: 0,    maxValue: 1 },
            { name: "freq",   automationRate: "a-rate", defaultValue: Math.min(1500.0, maxFreq), minValue: 10.0, maxValue: maxFreq },
            { name: "q",      automationRate: "a-rate", defaultValue: 1.0,                       minValue: 1.0,  maxValue: 100.0 },
            { name: "gain",   automationRate: "a-rate", defaultValue: 1e-2,                      minValue: 1e-6 }
        ];
    }

    constructor(_options)
    {
        super();
        this.makeMortal();

        const maxChannels = _options.outputChannelCount[0];

        this.a1 = 0;
        this.a2 = 0;
        this.b0 = 0;
        this.b1 = 0;
        this.b2 = 0;

        this.x1 = new Float32Array(maxChannels);
        this.x2 = new Float32Array(maxChannels);
        this.y1 = new Float32Array(maxChannels);
        this.y2 = new Float32Array(maxChannels);

        this.prevFreq = -1;
        this.prevQ = -1;
        this.prevGain = -1;
    }

    process(inputs, outputs, parameters) 
    {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const freq = parameters.freq;
        const q = parameters.q;
        const gain = parameters.gain;

        const paramsAreConstant = (freq.length === 1 && q.length === 1 && gain.length === 1);

        if (paramsAreConstant)
            this.calcCoefficients(freq[0], q[0], gain[0]);

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                // Recalc coefficients if needed
                if (paramsAreConstant === false) {
                    const f = (freq[s] !== undefined) ? freq[s] : freq[0];
                    const qs = (q[s] !== undefined) ? q[s] : q[0];
                    const g = (gain[s] !== undefined) ? gain[s] : gain[0];

                    this.calcCoefficients(f, qs, g);
                }

                // Calculate the new sample
                const y0 = this.b0 * inputChannel[s]
                         + this.b1 * this.x1[c]
                         + this.b2 * this.x2[c]
                         - this.a1 * this.y1[c]
                         - this.a2 * this.y2[c];

                // Shift the original samples
                this.x2[c] = this.x1[c];
                this.x1[c] = inputChannel[s];
    
                // Shift the filtered samples
                this.y2[c] = this.y1[c];
                this.y1[c] = y0;

                // Write the original/filtered sample to the output
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                outputChannel[s] = (b > 0) ? inputChannel[s] : y0;
            }
        }

        return this.keepAlive;
    }

    calcCoefficients(_freq, _q, _gain)
    {
        if (_freq === this.prevFreq && _q === this.prevQ && _gain === this.prevGain)
            return;

        const w0 = 2 * Math.PI * _freq / sampleRate;

        const cos_w0 = Math.cos(w0);
        const A = Math.sqrt(_gain);

        const alpha = Math.sin(w0) / (2 * _q);
        const alpha_a = alpha / A;
        const alpha_b = alpha * A;
    
        const a0 = 1 + alpha_a;
        const a1 = -2 * cos_w0;
        const a2 = 1 - alpha_a;
    
        const b0 = 1 + alpha_b;
        const b1 = a1;
        const b2 = 1 - alpha_b;
    
        this.a1 = a1 / a0;
        this.a2 = a2 / a0;
        this.b0 = b0 / a0;
        this.b1 = b1 / a0;
        this.b2 = b2 / a0;

        this.prevFreq = _freq;
        this.prevQ = _q;
        this.prevGain = _gain;
    }
}

registerProcessor("peak-eq-processor", PeakEQProcessor);

class LowPassFeedbackCombFilter
{
    constructor(_size)
    {
        this.damp1 = 0;
        this.damp2 = 0;
        this.feedback = 0;
        this.z1 = 0;

        this.buffer = new Float32Array(_size);
        this.readIndex = 0;
    }

    process(_sample)
    {
        // Read a sample from the buffer
        const out = this.buffer[this.readIndex];

        // Update the internal filter
        this.z1 = (this.z1 * this.damp1) + (out * this.damp2);

        // Write a sample (with feedback) to the buffer
        this.buffer[this.readIndex] = _sample + (this.z1 * this.feedback);

        // Increment the read frame
        ++this.readIndex;
        this.readIndex %= this.buffer.length;

        return out;
    }

    setFeedback(_feedback)
    {
        this.feedback = Math.min(Math.max(0, _feedback), 1);
    }

    setDamp(_damp)
    {
        this.damp1 = Math.min(Math.max(0, _damp), 1);
        this.damp2 = 1 - this.damp1;
    }
}

class AllPassFilter
{
    constructor(_size)
    {
        this.feedback = 0;

        this.buffer = new Float32Array(_size);
        this.readIndex = 0;
    }

    process(_sample)
    {
        // Read a sample from the buffer
        const out = this.buffer[this.readIndex];

        // Write a sample (with feedback) to the buffer
        this.buffer[this.readIndex] = _sample + (out * this.feedback);

        // Increment the read frame
        ++this.readIndex;
        this.readIndex %= this.buffer.length;

	    // Rearrangement of feedforward scalar of -1
	    return (out - _sample);
    }

    setFeedback(_feedback)
    {
        this.feedback = Math.min(Math.max(0, _feedback), 1);
    }
}

class Reverb1Processor extends AudioWorkletProcessor
{
    static NUM_LPFCFS = 8;
    static NUM_APFS = 4;

    static INPUT_GAIN = 0.015;
    static DAMP_SCALAR = 0.4;
    static ROOM_SCALAR = 0.28;
    static ROOM_OFFSET = 0.7;

    static LPFCF_EVEN = [
        1116,
        1188,
        1277,
        1356,
        1422,
        1491,
        1557,
        1617
    ];

    static LPFCF_ODD = [
        1139,
        1211,
        1300,
        1379,
        1445,
        1514,
        1580,
        1640
    ];

    static APF_EVEN = [
        556,
        441,
        341,
        225
    ];

    static APF_ODD = [
        579,
        464,
        364,
        248
    ]; 

    static get parameterDescriptors() 
    {
        return [
            { name: "bypass", automationRate: "a-rate", defaultValue: 0,    minValue: 0,   maxValue: 1 },
            { name: "size",   automationRate: "a-rate", defaultValue: 0.7,  minValue: 0.0, maxValue: 1.0 },
            { name: "damp",   automationRate: "a-rate", defaultValue: 0.1,  minValue: 0.0, maxValue: 1.0 },
            { name: "mix",    automationRate: "a-rate", defaultValue: 0.35, minValue: 0.0, maxValue: 1.0 }
        ];
    }

    constructor(_options)
    {
        super();
        this.makeMortal();

        const maxChannels = _options.outputChannelCount[0];

        this.prevSize = -1;
        this.prevDamp = -1;
        
        this.lpfcf = new Array(maxChannels);
        this.apf = new Array(maxChannels);

        const lpcf_tunings = [Reverb1Processor.LPFCF_EVEN, Reverb1Processor.LPFCF_ODD];
        const apf_tunings = [Reverb1Processor.APF_EVEN, Reverb1Processor.APF_ODD];

        for (let c = 0; c < maxChannels; ++c) {
            this.lpfcf[c] = new Array(Reverb1Processor.NUM_LPFCFS);
            this.apf[c] = new Array(Reverb1Processor.NUM_APFS);

            for (let i = 0; i < Reverb1Processor.NUM_LPFCFS; ++i)
                this.lpfcf[c][i] = new LowPassFeedbackCombFilter(lpcf_tunings[c % lpcf_tunings.length][i]);

            for (let i = 0; i < Reverb1Processor.NUM_APFS; ++i)
                this.apf[c][i] = new AllPassFilter(apf_tunings[c % apf_tunings.length][i]);
        }

        this.setSize(0.5);
        this.setDamp(0.5);
    
        for (let c = 0; c < maxChannels; ++c)
            for (let i = 0; i < Reverb1Processor.NUM_APFS; ++i)
                this.apf[c][i].setFeedback(0.5);
    }

    process(inputs, outputs, parameters) 
    {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const size = parameters.size;
        const damp = parameters.damp;
        const mix = parameters.mix;

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                const s = (size[s] !== undefined) ? size[s] : size[0];
                const d = (damp[s] !== undefined) ? damp[s] : damp[0];

                // Update model if needed
                this.setSize(s);
                this.setDamp(d);

                // Copy the input to the output
                outputChannel[s] = inputChannel[s];

                let out = 0;
                const val = inputChannel[s] * Reverb1Processor.INPUT_GAIN;
                
                // Process the combs in parallel
                for (let i = 0; i < Reverb1Processor.NUM_LPFCFS; ++i)
                    out += this.lpfcf[c][i].process(val);

                // Process the allpasses in series
                for (let i = 0; i < Reverb1Processor.NUM_APFS; ++i)
                    out = this.apf[c][i].process(out);

                // Check bypass state
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                if (b > 0.0) {
                    continue;
                }

                // Mix the reverberated and original samples
                const m = (mix[s] !== undefined) ? mix[s] : mix[0];

                outputChannel[s] *= (1 - m);
                outputChannel[s] += (out * m);
            }
        }

        return this.keepAlive;
    }

    setSize(_size)
    {
        if (_size === this.prevSize)
            return;

        const size = (_size * Reverb1Processor.ROOM_SCALAR) + Reverb1Processor.ROOM_OFFSET;

        for (let c = 0; c < this.lpfcf.length; ++c)
            for (let i = 0; i < Reverb1Processor.NUM_LPFCFS; ++i)
                this.lpfcf[c][i].setFeedback(size);

        this.prevSize = _size;
    }

    setDamp(_damp)
    {
        if (_damp === this.prevDamp)
            return;

        const damp = _damp * Reverb1Processor.DAMP_SCALAR;

        for (let c = 0; c < this.lpfcf.length; ++c)
            for (let i = 0; i < Reverb1Processor.NUM_LPFCFS; ++i)
                this.lpfcf[c][i].setDamp(damp);

        this.prevDamp = _damp;
    }
}

registerProcessor("reverb1-processor", Reverb1Processor);

class TremoloProcessor extends AudioWorkletProcessor
{
    static get parameterDescriptors() {
        return [
            { name: "bypass",    automationRate: "a-rate", defaultValue: 0,   minValue: 0,   maxValue: 1 },
            { name: "rate",      automationRate: "a-rate", defaultValue: 5.0, minValue: 0.0, maxValue: 20.0 },
            { name: "intensity", automationRate: "a-rate", defaultValue: 1.0, minValue: 0.0, maxValue: 1.0 },
            { name: "offset",    automationRate: "a-rate", defaultValue: 0.0, minValue: 0.0, maxValue: 1.0 },
            { name: "shape",     automationRate: "a-rate", defaultValue: 0,   minValue: 0,   maxValue: 4 }
        ];
    }

    constructor(_options) {
        super();
        this.makeMortal();

        const maxChannels = _options.outputChannelCount[0];

        this.prevRate = new Array(maxChannels).fill(1.0);
        this.prevOffset = new Array(maxChannels).fill(0.0);
        this.prevShape = new Array(maxChannels).fill(LFO.Shape.INV_SAWTOOTH);

        this.lfo = new Array(maxChannels);

        for (let c = 0; c < maxChannels; ++c) {
            this.lfo[c] = new WavetableLFO();

            this.lfo[c].setFs(sampleRate);
            this.lfo[c].setFreq(this.prevRate[c]);
            this.lfo[c].setShape(this.prevShape[c]);

            if (c % 2 === 1) {
                // Only set offset for odd channels
                this.lfo[c].setPhaseOffset(this.prevOffset[c]);
            }
        }
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        const bypass = parameters.bypass;
        const rate = parameters.rate;
        const intensity = parameters.intensity;
        const offset = parameters.offset;
        const shape = parameters.shape;

        for (let c = 0; c < input.length; ++c) {
            const inputChannel = input[c];
            const outputChannel = output[c];

            for (let s = 0; s < inputChannel.length; ++s) {
                // Copy the input to the output
                outputChannel[s] = inputChannel[s];

                // Update LFO parameters
                const r = (rate[s] !== undefined) ? rate[s] : rate[0];
                const o = (offset[s] !== undefined) ? offset[s] : offset[0];
                const sh = (shape[s] !== undefined) ? shape[s] : shape[0];

                this.updateLFO(c, r, o, sh);

                // Read (and advance) the LFO
                const lfoOut = this.lfo[c].read();

                // Check bypass state
                const b = (bypass[s] !== undefined) ? bypass[s] : bypass[0];

                if (b > 0.0) {
                    continue;
                }

                // Scale a sample using the LFO output and intensity
                const i = (intensity[s] !== undefined) ? intensity[s] : intensity[0];

                const out = inputChannel[s] * lfoOut * i;

                // Mix the scaled sample with the original sample
                outputChannel[s] *= (1.0 - i);
                outputChannel[s] += out;
            }
        }

        return this.keepAlive;
    }

    updateLFO(_channel, _rate, _offset, _shape) {
        if (_rate !== this.prevRate[_channel]) {
            this.lfo[_channel].setFreq(_rate);
            this.prevRate[_channel] = _rate;
        }

        if (_offset !== this.prevOffset[_channel]) {
            // Only set offset for odd channels
            if (_channel % 2 === 1) {
                this.lfo[_channel].setPhaseOffset(_offset);
            }

            this.prevOffset[_channel] = _offset;
        }

        if (_shape !== this.prevShape[_channel]) {
            this.lfo[_channel].setShape(_shape);
            this.prevShape[_channel] = _shape;
        }
    }
}

registerProcessor("tremolo-processor", TremoloProcessor);

function LFO() {}

LFO.Shape = {
	INV_SAWTOOTH: 0,
	SAWTOOTH: 1,
    SINE: 2,
    SQUARE: 3,
    TRIANGLE: 4,
    NUM_SHAPES: 5
};

/*
	LFO Wavetable Generators ~
	These functions generate a 1Hz waveform from a normalised phase parameter (range 0 to 1).
	The generated waveforms also range from 0 to 1.
	The wavetables produced by these functions should only be used for LFOs,
	as reading them at higher frequencies will begin to cause aliasing.
*/
LFO.generateInvSawtooth = function(_phase) {
    return 1.0 - _phase;
};

LFO.generateSawtooth = function(_phase) {
    return _phase;
};

LFO.generateSine = function(_phase) {
	// Offset by (-pi/2) in order to start from 0
    return 0.5 * (Math.sin((_phase * 2.0 * Math.PI) - (Math.PI / 2.0)) + 1.0);
};

LFO.generateSquare = function(_phase) {
    if (_phase < 0.5) {
        return 0.0;
    }

    return 1.0;
};

LFO.generateTriangle = function(_phase) {
    if (_phase < 0.5) {
        return 2.0 * _phase;
    }

    return 2.0 - (2.0 * _phase);
};

LFO.wavetableFns = [
	LFO.generateInvSawtooth,
    LFO.generateSawtooth,
    LFO.generateSine,
    LFO.generateSquare,
    LFO.generateTriangle
];

Wavetable.len = 512;
Wavetable.phaseInc = 1.0 / Wavetable.len;

function Wavetable(_fn) {
    this.data = new Float32Array(Wavetable.len);

	for (let i = 0; i < Wavetable.len; ++i) {
		this.data[i] = _fn(i * Wavetable.phaseInc);
	}
}

Wavetable.prototype.read = function(_phase) {
	_phase = Math.max(0.0, _phase);
	_phase = Math.min(_phase, 1.0);
	
	const targetIndex = _phase * Wavetable.len;

	const targetIndexInt = ~~targetIndex;
	const targetIndexFrac = targetIndex - targetIndexInt;

	let index1 = targetIndexInt;
	let index2 = index1 + 1;

	if (index1 >= Wavetable.len) {
		index1 -= Wavetable.len;
	}

	if (index2 >= Wavetable.len) {
		index2 -= Wavetable.len;
	}

	const samp1 = this.data[index1];
	const samp2 = this.data[index2];

	return samp1 + (samp2 - samp1) * targetIndexFrac;
};

WavetableLFO.wavetables = [];
WavetableLFO.initialisedWavetables = false;

WavetableLFO.minFreq = 0.0;
WavetableLFO.maxFreq = 20.0;

function WavetableLFO() {
    this.fs = 48000;
	this.shape = LFO.Shape.SINE;
	this.freq = 1.0;
	this.phase = 0.0;
	this.phaseInc = 0.0;
	this.phaseOffset = 0.0;

	if (WavetableLFO.initialisedWavetables == true) {
		return;
	}

	for (let i = 0; i < LFO.Shape.NUM_SHAPES; ++i) {
		WavetableLFO.wavetables[i] = new Wavetable(LFO.wavetableFns[i]);
	}

	WavetableLFO.initialisedWavetables = true;
}

WavetableLFO.isInitialised = function() {
	return (WavetableLFO.initialisedWavetables == true);
};

WavetableLFO.prototype.setFs = function(_fs) {
	this.fs = _fs;
	this.updatePhaseInc();
};

WavetableLFO.prototype.setFreq = function(_freq) {
	_freq = Math.max(WavetableLFO.minFreq, _freq);
	_freq = Math.min(_freq, WavetableLFO.maxFreq);

	this.freq = _freq;
	this.updatePhaseInc();
};

WavetableLFO.prototype.setPhaseOffset = function(_offset) {
	_offset = Math.max(0.0, _offset);
	_offset = Math.min(_offset, 1.0);

	const diff = _offset - this.phaseOffset;

	this.phaseOffset = _offset;
	this.phase += diff;

	while (this.phase >= 1.0) {
		this.phase -= 1.0;
	}

	while (this.phase < 0.0) {
		this.phase += 1.0;
	}
};

WavetableLFO.prototype.setShape = function(_shape) {
	_shape = Math.max(0, _shape);
	_shape = Math.min(_shape, LFO.Shape.NUM_SHAPES - 1);

	this.shape = _shape;
};

WavetableLFO.prototype.read = function() {
	const result = WavetableLFO.wavetables[this.shape].read(this.phase);

	this.phase += this.phaseInc;

	while (this.phase >= 1.0) {
		this.phase -= 1.0;
	}

	return result;
};

WavetableLFO.prototype.updatePhaseInc = function() {
	this.phaseInc = this.freq / this.fs;
};

