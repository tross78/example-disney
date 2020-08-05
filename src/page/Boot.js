import Phaser from 'phaser';
import AssetManifest from '../config/ProgressAssetManifest';
import ManifestLoader from 'phaser-manifest-loader';
import { LoadProgressBarAssets } from "Components/LoadProgressBar";

export default class extends Phaser.State {
    init () {
        this.input.maxPointers = 1;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
    }
    preload () {
    }
    create () {
        const req = require.context(`../assets/${process.env.language}`, true, /.*\.png|mp3|jpg$/);
        const loader = this.game.plugins.add(ManifestLoader, req);
        loader.loadManifest(AssetManifest).then(()=>this.game.state.start('Preloader'));
        this.loadAssets(LoadProgressBarAssets);
    }
    loadAssets(asssets) {
        Object.keys(asssets).forEach(function(key) {
            const item = asssets[key];
            switch(item.type){
            case "image":
                this.load.image(key, item.value);
                break;
            case "atlas":
                this.load.atlasJSONArray(key, item.value, item.json);
                break;
            case "audio":
                this.load.audio(key, item.value);
            }
        }, this);
    }
}