import Phaser from 'phaser';
import ManifestLoader from 'phaser-manifest-loader';
import AssetManifest from '../config/AssetManifest';
import { GameSuccessAssets } from "Components/GameSuccess/";
import { SystemButtonsAssets } from "Components/SystemButtons/";
import { FinishButtonsAssets } from "Components/FinishButtons/";
import { LoadProgressBar } from "Components/LoadProgressBar/";

export default class extends Phaser.State {
    init () {
        // this.processBarSize = {w: 446, h: 52};
        // this.processBarOffset = {x: 0, y: 240};
    }
    preload () {
    }
    create () {
        this.add.image(0, 0, 'loading_bg');
        this.progressBar = new LoadProgressBar(this.game);
        this.loadAssets(SystemButtonsAssets);
        this.loadAssets(FinishButtonsAssets);
        this.loadAssets(GameSuccessAssets);
        const req = require.context(`../assets/${process.env.language}`, true, 
            /.*\.png|json|ttf|woff|woff2|xml|mp3|wav|jpg$/);
        const loader = this.game.plugins.add(ManifestLoader, req);
        loader.loadManifest(AssetManifest).then(()=>{
            this.progressBar.loadComplete(() => this.startGame());
        });
    }
    startGame() {
        this.game.state.start("GamePlay");
    }
    loadAssets(asssets) {
        Object.keys(asssets).forEach(function(key) {
            const item = asssets[key];
            switch(item.type){
            case "image":
                this.load.image(key, item.value);
                break;
            case "atlas":
                this.load.atlas(key, item.value, null, item.json);
                break;
            case "audio":
                this.load.audio(key, item.value);
                break;
            }
            
        }, this);
    }
}