const discord = require('discord.js');
const ytdl = require('ytdl-core');

class BotDiscordMusic {
  constructor() {
    this._prefix = '!';
    this._imReady = false;
    this._queue = [];
    this._client = new discord.Client();
    this._connection = undefined;
    this._message = undefined;
    this._dispatcher = undefined;
    this._youtubeController = ytdl;

    this._client.on('ready', () => {
      console.log(`I'm connected!`);
    });

    this._client.on('message', (message) => {

      if(message.author.bot)
        return;
      this._message = message;
      const command = message.content.split(' ');

      switch(command[0]) {
        case `${this._prefix}join`:
          this.join();
          break;
        case `${this._prefix}leave`:
          this.leave();
          break;
        case `${this._prefix}play`:
          this.play(command[1]);
          break;
        case `${this._prefix}pause`:
          this.pause();
          break;
        case `${this._prefix}resume`:
          this.resume();
          break;
        case `${this._prefix}skip`:
          this.skip();
          break;
        case `${this._prefix}end`:
          this.end();
          break;
      }

    });

    this._client.login(process.env.TOKEN_BOT);
  }

    async join() {
      this._connection = await this._message.member.voice.channel.join();
      this._imReady = true;
    }

    leave() {
      if(!this._imReady){
        this._message.reply(`I'm already out of the voice channel`);
        return;
      }

      this._queue = [];
      this._imReady = false;
      this._connection = undefined;
      this._dispatcher = undefined;
      this._message.member.voice.channel.leave();
    }

    playMusic() {
      this._dispatcher = this._connection.play(this._youtubeController(this._queue[0]));
      this._dispatcher.on('finish', () => {
        this._queue.shift();
        if(this._queue.length >= 1)
          this.playMusic();
      });
    }

    play(link) {
      if(!this._message.member.voice.channel) {
        this._message.reply(`You are not on any voice channels`);
        return;
      }

      if(!this._imReady) {
        this._message.reply(`I'm not on any voice channels, type '! Join'`);
        return;
      }

      if(!this._youtubeController.validateURL(link)) {
        this._message.reply(`This link is invalid!`);
        return;
      }

      this._queue.push(link);

      if(this._queue.length === 1)
        this.playMusic();
    }

    pause() {
      if(!this._message.member.voice.channel) {
        this._message.reply(`You are not on any voice channels`);
        return;
      }

      if(!this._imReady) {
        this._message.reply(`I'm not on any voice channels, type '! Join'`);
        return;
      }

      if(this._dispatcher === undefined) {
        this._message.reply("Im not playing nothing now!");
        return;
      }
      
      this._dispatcher.pause()
      console.log(this._dispatcher);
      this._message.reply(`Paused!`);
      
    }

    resume() {
      if(!this._message.member.voice.channel) {
        this._message.reply(`You are not on any voice channels`);
        return;
      }

      if(!this._imReady) {
        this._message.reply(`I'm not on any voice channels, type '! Join'`);
        return;
      }

      this._dispatcher.resume();
      this._message.reply(`Playing!`);
    }

    skip() {
      if(!(this._queue.length >= 2)) {
        this._message.reply(`Dont exists other music in queue`);
        return;
      }

      this._queue.shift();
      this.playMusic();
    }
    
    end() {
      if(!this._message.member.voice.channel) {
        this._message.reply(`You are not on any voice channels`);
        return;
      }

      if(!this._imReady) {
        this._message.reply(`I'm not on any voice channels, type '! Join'`);
        return;
      }

      if(this._dispatcher === undefined) {
        this._message.reply("Im not playing nothing now!");
        return;
      }

      this._dispatcher.end();
      this._queue = [];
      this._message.reply(`Finish!`);
    }
}
module.exports = { BotDiscordMusic };