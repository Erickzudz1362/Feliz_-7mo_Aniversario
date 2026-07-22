class GardenSoundscape {
  constructor(){this.ctx=null;this.master=null;this.started=false;this.enabled=true;this.timers=[]}
  async start(){
    if(this.started){await this.ctx.resume();return}
    const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
    try{this.ctx=new AudioContext({sampleRate:48000})}catch(_){this.ctx=new AudioContext()}
    this.master=this.ctx.createGain();
    this.master.gain.setValueAtTime(0,this.ctx.currentTime);this.master.gain.linearRampToValueAtTime(.24,this.ctx.currentTime+5);this.master.connect(this.ctx.destination);
    this.createBreeze();this.scheduleBird();this.scheduleChime();this.started=true;
  }
  createBreeze(){
    const length=this.ctx.sampleRate*4,buffer=this.ctx.createBuffer(2,length,this.ctx.sampleRate);
    for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);let last=0;for(let i=0;i<length;i++){const white=Math.random()*2-1;last=last*.985+white*.015;data[i]=last*2.4}}
    const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain(),lfo=this.ctx.createOscillator(),lfoGain=this.ctx.createGain();
    source.buffer=buffer;source.loop=true;filter.type="lowpass";filter.frequency.value=720;gain.gain.value=.16;lfo.frequency.value=.075;lfoGain.gain.value=.055;
    lfo.connect(lfoGain).connect(gain.gain);source.connect(filter).connect(gain).connect(this.master);source.start();lfo.start();
  }
  scheduleBird(){if(!this.ctx)return;const delay=1200+Math.random()*4200;this.timers.push(setTimeout(()=>{if(this.enabled)this.birdCall();this.scheduleBird()},delay))}
  birdCall(){
    const now=this.ctx.currentTime,pan=Math.random()*1.5-.75,notes=2+Math.floor(Math.random()*3);
    for(let i=0;i<notes;i++){const osc=this.ctx.createOscillator(),gain=this.ctx.createGain(),panner=this.ctx.createStereoPanner(),start=now+i*(.09+Math.random()*.05),base=1700+Math.random()*1200;
      osc.type=i%2?"sine":"triangle";osc.frequency.setValueAtTime(base,start);osc.frequency.exponentialRampToValueAtTime(base*(1.25+Math.random()*.35),start+.07);osc.frequency.exponentialRampToValueAtTime(base*.9,start+.15);
      gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.025+Math.random()*.025,start+.018);gain.gain.exponentialRampToValueAtTime(.001,start+.17);panner.pan.value=pan;
      osc.connect(gain).connect(panner).connect(this.master);osc.start(start);osc.stop(start+.2)}
  }
  scheduleChime(){this.timers.push(setTimeout(()=>{if(this.enabled&&Math.random()>.35)this.chime();this.scheduleChime()},9000+Math.random()*9000))}
  chime(){if(!this.ctx||!this.master)return;const now=this.ctx.currentTime;[523.25,659.25,783.99].forEach((freq,i)=>{const osc=this.ctx.createOscillator(),gain=this.ctx.createGain(),pan=this.ctx.createStereoPanner();osc.type="sine";osc.frequency.value=freq*2;gain.gain.setValueAtTime(.012,now+i*.13);gain.gain.exponentialRampToValueAtTime(.0001,now+2.8+i*.13);pan.pan.value=(i-1)*.35;osc.connect(gain).connect(pan).connect(this.master);osc.start(now+i*.13);osc.stop(now+3+i*.13)})}
  setEnabled(value){this.enabled=value;if(!this.master)return;this.master.gain.cancelScheduledValues(this.ctx.currentTime);this.master.gain.linearRampToValueAtTime(value ? .24 : 0,this.ctx.currentTime+.5)}
  setLevel(value){if(!this.master||!this.enabled)return;this.master.gain.cancelScheduledValues(this.ctx.currentTime);this.master.gain.linearRampToValueAtTime(value,this.ctx.currentTime+.65)}
}
window.gardenSoundscape=new GardenSoundscape();
