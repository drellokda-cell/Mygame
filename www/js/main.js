// Точка входа: настройки Phaser и список сцен.
window.addEventListener('load', () => {
  Save.load();
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: DZ.W,
      height: DZ.H
    },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    input: { activePointers: 4 },
    scene: [BootScene, TitleScene, LobbyScene, HUDScene]
  });
});
