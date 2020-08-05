import Phaser from 'phaser';
import { GameSuccess } from "Components/GameSuccess/index";
import { SystemButtons } from "Components/SystemButtons/";
import { GestureTiper } from "Components/GestureTiper/";
import{
    PassPosition,
    TipPathPosition
} from "../config/config" ;
const GameState = {
    UnStart: 0,
    Helping: 1,
    GameIng: 2,
    KiteShine: 3,
    GameOver: 4

};

export default class extends Phaser.State {
    init() {
        this.gameState = GameState.UnStart;
        this.wrongNum = 0;
        this.radius = 30;
        this.fridaOffset = 5;
        this.currentPaint = 0;
        this.paintState = false;
        this.pointOutIn = false;
        this.dragedPosition = [];
        this.errorAudioArray = [];
        
        const circle = this.add.bitmapData(this.radius * 2, this.radius * 2);
        circle.circle(this.radius, this.radius, this.radius, "rgba(255,255,255,1)");
        this.circle = this.make.sprite(0, 0, circle);
        this.circle.anchor.setTo(0.5);

        this.paintSpriteGroup = ["trangle2", "frame2", "S2", "eight3"];
        this.bgSpriteGroup = ["trangle", "frame", "S", "eight"];
        this.pasteAreaGroup = ["trangle4", "frame4", "S4", "eight4"];
        this.paintAreaGroup = ["trangle_2", "frame_2", "s_2", "eight_2"];
        this.helpPicetureGroup = ["help_trangle", "help_frame", "help_s", "help_8"];

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (!this.isMute) {
                    this.sound.setMute();
                }
            } else {
                if (!this.isMute) {
                    this.sound.unsetMute();
                }
            }
        }, false);
    }
    create() {
        this.createbackground();
        this.createAudios();
        this.createButtons();
    }
    createButtons() {
        this.systemBtns = new SystemButtons(this.game, "background", "title",
            "playIntro", "help1");
        this.systemBtns.setTutorialEndCallback(() => this.startGame());
        this.systemBtns.enableExitButton();
        this.gameSuccess = new GameSuccess(this.game);
        this.systemTip = new GestureTiper(this.game);
    }
    createbackground() {
        this.mainGroup = this.add.group();
        this.mainGroup.position.setTo(0, 0);
        this.gameGroup = this.add.group();
        this.gameGroup.position.setTo(0, 0);
        this.bg = this.add.sprite(0, 0, "bg");
        this.gameGroup.add(this.bg);
        this.gameGroup.add(this.mainGroup);
    }
    createBg(paintID) {
        this.gameState = GameState.Helping;
        this.mainGroup.destroy(true, true);

        const paintGroup = this.add.group();
        const touchArea = this.add.sprite(0, 0, this.paintAreaGroup[paintID]);
        this.bgMouseDetection(touchArea);
        paintGroup.add(touchArea);
        const component = this.add.image(0, 0, this.bgSpriteGroup[paintID]);
        paintGroup.add(component);

        this.paintingArea = this.make.bitmapData(this.world.centerX * 2, this.world.centerY * 2);
        const text = this.make.sprite(0, 0, this.pasteAreaGroup[paintID]);
        this.paintingArea.copy(text);
        this.paintingImage = this.add.sprite(0, 0, this.paintingArea);

        this.innerGrow = this.make.bitmapData(this.world.centerX * 2, this.world.centerY * 2);
        const text2 = this.make.sprite(0, 0, this.paintSpriteGroup[paintID]);
        this.innerGrow.copy(text2);
        this.innerGrowImage = this.add.sprite(0, 0, this.innerGrow);

        paintGroup.add(this.paintingImage);
        paintGroup.add(this.innerGrowImage);
        this.mainGroup.add(paintGroup);

        this.add.tween(this.mainGroup).to({ alpha: 1 },500, "Linear", true).onComplete.add(function () {
            this.gameState = GameState.GameIng;
            this.tipEffector(paintID);
        }, this);
        this.tipstop = false;
        this.systemBtns.setHelpCallback(()=>this.tipEffector(paintID,1)); 
    }
    tipEffector(paintID,norepeat) {
        if(this.tipstate){
            return;
        }
        let self = this;
        this.tipstate = true;
        const path = TipPathPosition[this.bgSpriteGroup[paintID]];
        const tipPath = [];
        for (let i = 1;i<path.length;i++) {
            tipPath.push({x:path[i].x,y:path[i].y});
        }
        if(norepeat){
            this.touchCancel = false;
        }else{
            this.touchCancel = true; 
        }
        this.systemTip.showDrag({x:path[0].x,y:path[0].y},tipPath,function(){
            self.tipstate = false;
            if(!norepeat){
                if(!self.tipstop){
                    self.tipEffector(paintID,norepeat);
                }
            }else{
                self.touchCancel = true;    
            }
        });
    }
    setKitePosition(mode) {
        this.kiteSprite.position.setTo(PassPosition[this.bgSpriteGroup[mode]][0].x,
            PassPosition[this.bgSpriteGroup[mode]][0].y - 300);
        this.shineKiteSprite.position.setTo(PassPosition[this.bgSpriteGroup[mode]][0].x,
            PassPosition[this.bgSpriteGroup[mode]][0].y - 300);
    }
    clearPaintArea() {
        if (!this.painted)
            return;
        this.emptyPaint();
        this.paintingArea.copy(this.make.sprite(0, 0, this.pasteAreaGroup[this.currentPaint]));
        this.innerGrow.copy(this.make.sprite(0, 0, this.paintSpriteGroup[this.currentPaint]));
        this.painted = false;
    }
    bgMouseDetection(sprite) {
        sprite.inputEnabled = true;
        sprite.input.pixelPerfectOver = true;
        sprite.events.onInputOut.add(function () {
            if (this.gameState === GameState.GameOver
                || this.gameState === GameState.KiteShine
                || this.gameState === GameState.Helping)
                return;
            if(!this.catchHandleRing){
                return; 
            }
            this.dragedPosition.length = 0;
            this.clearPaintArea();
            this.paintState = false;
            this.catchHandleRing = false;
            this.restartCurrentMode(this.currentPaint,false);
        }, this);
        sprite.events.onInputOver.add(function () {
            this.paintState = true;
            this.pointOutIn = true;
        }, this);
    }
    createAudios() {
        this.bgAudio = this.add.audio("Ambience");
        this.musicAudio = this.add.audio("music");
        this.selectAudio = this.add.audio("Select");
        this.paintAudio = this.add.audio("Spray");
        this.gameSuccessAudio = this.add.audio("Success");
        for(let i = 0;i<3;i++){
            let num = i+1;
            this.errorAudioArray[i] = this.add.audio("Interrupt_"+num);
        }
    }
    playAudio(audio,repeat){
        if(audio.isPlaying){
            return;
        }
        audio.play(null,null,1,repeat);
    }
    wrongPaintAudio(){
        this.playAudio(this.errorAudioArray[Math.floor(Math.random()*3)],false);
    }

    startGame() {
        this.createBg(this.currentPaint);

        this.kiteSprite = this.add.sprite(200, 100, "kiteJsonData");
        this.kiteSprite.anchor.setTo(0.5);
        this.kiteSprite.scale.setTo(0.5);
        this.kiteSpriteAnimation = this.kiteSprite.animations.add("kiteJsonData");
        this.kiteSpriteAnimation.play(5, true);

        this.shineKiteSprite = this.add.sprite(200, 100, "kiteShine");
        this.shineKiteSprite.anchor.setTo(0.5);
        this.shineKiteSprite.scale.setTo(0.5);
        this.shineKiteSprite.alpha = 0;
        this.shineKiteSpriteAnimation = this.shineKiteSprite.animations.add("kiteShine");
        this.shineKiteSpriteAnimation.play(5, true);
        this.setKitePosition(this.currentPaint);

        this.handleRing = this.add.sprite(
            PassPosition[this.bgSpriteGroup[this.currentPaint]][0].x,
            PassPosition[this.bgSpriteGroup[this.currentPaint]][0].y, "button_handle");
        this.handleRing.anchor.setTo(0.5);
        this.catchHandleRing = false;
        this.lineGroup = this.add.group();
        this.kiteGroup = this.add.group();
        this.kiteGroup.add(this.lineGroup);
        this.kiteGroup.add(this.kiteSprite);
        this.kiteGroup.add(this.shineKiteSprite);
        this.kiteGroup.add(this.handleRing);
        this.kiteGroup.alpha = 0;
        this.gameGroup.add(this.kiteGroup);
        this.gameState = GameState.GameIng;
        this.game.physics.enable(this.kiteSprite, Phaser.Physics.ARCADE);
        this.game.physics.enable(this.shineKiteSprite, Phaser.Physics.ARCADE);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.add.tween(this.kiteGroup).to({ alpha: 1 },500, "Linear", true).onComplete.add(function () {
            this.game.input.addMoveCallback(this.paint, this);
            this.game.input.addTouchLockCallback(this.pointOnUp, this, true);
        }, this);
        this.playAudio(this.bgAudio,true);
        this.playAudio(this.musicAudio,true);
        this.systemBtns.setMuteCallback(() => this.exchangeBgMusic());
    }
    exchangeBgMusic(){
        if(this.bgAudio.volume==1){
            this.bgAudio.volume = 0;
            this.musicAudio.volume = 0;
        }else{
            this.bgAudio.volume = 1;
            this.musicAudio.volume = 1;
        }
    }
    restartCurrentMode(mode,newmode,noadd) {
        this.dragedPosition.length = 0;
        this.catchHandleRing = false;
        this.clearPaintArea();
        this.handleRing.position.setTo(
            PassPosition[this.bgSpriteGroup[mode]][0].x,
            PassPosition[this.bgSpriteGroup[mode]][0].y);

        this.paintAudio.stop();
            
        if(!newmode){
            if(!noadd){
                this.wrongNum++;
                this.wrongPaintAudio();
            }
            if(this.wrongNum==5){
                this.wrongNum = 0;
                this.tipEffector(mode,1); 
            }
        }else{
            this.wrongNum = 0;
        }
    }
    distanceDetection(p1, mode) {
        const positionConfig = PassPosition[this.bgSpriteGroup[mode]];
        for (let i = 0; i < positionConfig.length; i++) {
            const positionPoint = positionConfig[i];
            if (Math.sqrt(Math.pow(positionPoint.x - p1.x, 2)
                + Math.pow(positionPoint.y - p1.y, 2)) < this.radius) {
                for (let j = 0; j < this.dragedPosition.length; j++) {
                    const dragedPoint = this.dragedPosition[j];
                    if (positionPoint.x === dragedPoint.x
                        && positionPoint.y === dragedPoint.y) {
                        return;
                    }
                }
                this.dragedPosition.push(positionPoint);
                this.judgeFinish();
                return;
            }
        }
    }
    distance(p1) {
        return Math.sqrt(Math.pow(this.handleRing.x - p1.x, 2)
            + Math.pow(this.handleRing.y - p1.y, 2));
    }
    playCatchRingAudio(){
        if(this.catchHandleRing){
            return;
        }else{
            this.playAudio(this.selectAudio,false);
        }
    }
    paint(pointer, x, y) {
        if (this.gameState === GameState.GameOver
            || this.gameState === GameState.KiteShine
            || this.gameState === GameState.Helping)
            return;
        if (pointer.isDown) {
            if(this.touchCancel){
                this.tipstop = true;
                this.tipstate = false;
            }
            const point = new Phaser.Point(x, y);
            if (this.distance(point) < 20) {
                this.catchHandleRing = true;
            }
            if (this.paintState && this.catchHandleRing) {
                if (this.pointOutIn) {
                    this.add.tween(this.handleRing).to({ x: point.x, y: point.y },100, "Linear", true).onComplete.add(function () {
                        this.pointOutIn = false;
                    }, this);
                } else {
                    this.handleRing.position.setTo(x, y);
                }
                if (!this.painted) {
                    this.painted = true;
                }
                this.playAudio(this.paintAudio,false);
                this.paintingArea.draw(this.circle, x, y, this.radius * 2, this.radius * 2, "destination-out");
                this.innerGrow.draw(this.circle, x, y, this.radius * 2, this.radius * 2, "destination-out");
                this.distanceDetection(point, this.currentPaint);
            }
        }
    }
    pointOnUp() {
        if (this.gameState === GameState.GameOver || this.gameState === GameState.KiteShine)
            return;
        this.restartCurrentMode(this.currentPaint,false,true);
    }
    judgeFinish() {
        const positionConfig = PassPosition[this.bgSpriteGroup[this.currentPaint]];
        if (this.dragedPosition.length < positionConfig.length) {
            for (let i = 0; i < this.dragedPosition.length; i++) {
                if (this.dragedPosition[i].x !== positionConfig[i].x
                    || this.dragedPosition[i].y !== positionConfig[i].y) {
                    this.restartCurrentMode(this.currentPaint);
                    return;
                }
            }
        }
        if (this.dragedPosition.length !== positionConfig.length) {
            return;
        }
        for (let i = 0; i < this.dragedPosition.length; i++) {
            if (this.dragedPosition[i].x !== positionConfig[i].x
                || this.dragedPosition[i].y !== positionConfig[i].y) {
                this.restartCurrentMode(this.currentPaint);
                return;
            }
        }
        this.finishCurrentPaint();
        this.paintAudio.stop();
    }
    emptyPaint() {
        const rectangleArea = this.add.bitmapData(this.world.centerX * 2, this.world.centerY * 2);
        rectangleArea.rect(0, 0, this.world.centerX * 2, this.world.centerY * 2);
        this.innerGrow.draw(rectangleArea, 0, 0, this.world.centerX * 2, this.world.centerY * 2, "destination-out");
        this.paintingArea.draw(rectangleArea, 0, 0, this.world.centerX * 2, this.world.centerY * 2, "destination-out");
    }
    finishCurrentPaint() {
        this.currentPaint++;
        this.gameState = GameState.KiteShine;
        this.playAudio(this.gameSuccessAudio,false);
        this.emptyPaint();
        this.add.tween(this.shineKiteSprite).to({ alpha: [1, 0, 1, 0, 1, 0] },2000, "Linear", true).onComplete.add(function () {
            if (this.currentPaint < this.paintSpriteGroup.length) {
                this.gameState = GameState.GameIng;
                this.createBg(this.currentPaint);
                this.restartCurrentMode(this.currentPaint,true);
            } else {
                this.gameState = GameState.GameOver;
                this.add.tween(this.mainGroup).to({ alpha: 0 }, 500, "Linear", true).onComplete.add(function () {
                    this.add.tween(this.kiteSprite).to({ x: this.world.centerX, y: this.world.centerY }, 1000, "Linear", true);
                    this.add.tween(this.handleRing).to({ x: this.world.centerX, y: this.world.centerY }, 1000, "Linear", true);
                    this.add.tween(this.kiteSprite.scale).to({ x: 1, y: 1 }, 1000, "Linear", true).onComplete.add(function () {
                        console.log("game over");
                        let burnStar = this.add.sprite(this.world.centerX,this.world.centerY,"starBurn");
                        burnStar.anchor.setTo(0.5);
                        let burnStarAnimation = burnStar.animations.add("sparkle_touch");
                        burnStarAnimation.play(15);
                        burnStarAnimation.onComplete.addOnce(function(){
                            this.finishGame();
                        },this);
                    }, this);
                }, this);
            }
        }, this);
    }
    update() {
        if (this.gameState === GameState.UnStart)
            return;
        if (this.lineGroup) {
            this.lineGroup.destroy(true, true);
        }
        this.line = this.game.add.graphics(0, 0);
        this.line.lineStyle(3, 0x8b5740, 1);
        this.line.moveTo(this.handleRing.x, this.handleRing.y);
        this.line.lineTo(this.kiteSprite.x, this.kiteSprite.y - 100);
        this.lineGroup.addChild(this.line);
        if(this.gameState === GameState.GameOver)
            return;
        this.game.physics.arcade.moveToXY(this.kiteSprite,
            this.world.centerX + (this.handleRing.x - this.world.centerX) * 3,
            this.handleRing.y - 300,
            60, 500);
        this.game.physics.arcade.moveToXY(this.shineKiteSprite,
            this.world.centerX + (this.handleRing.x - this.world.centerX) * 3,
            this.handleRing.y - 300,
            60, 500);
    }
    finishGame() {
        this.game.input.deleteMoveCallback(this.paint, this);
        this.showGameSuccess();
    }
    showGameSuccess() {
        if (this.successTimer) clearTimeout(this.successTimer);
        this.successTimer = setTimeout(() => {
            this.gameSuccess.showGameSuccess();
        }, 200);
    }
}