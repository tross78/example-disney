
import 'p2';
import 'pixi';
import Phaser from 'phaser';
window.Phaser = Phaser;

import GamePlay from './page/GamePlay';
import Preloader from './page/Preloader';
import Boot from './page/Boot';

const game = new Phaser.Game(1280, 720, Phaser.CANVAS);

game.state.add('Preloader', Preloader);
game.state.add('Boot', Boot);
game.state.add('GamePlay', GamePlay);

game.state.start('Boot');
export default game;



