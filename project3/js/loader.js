WebFont.load({
    google: {
      families: ['Press Start 2P', 'Pirata One']
    },
    active:e=>{
    	console.log("font loaded!");
    	// pre-load the images
		PIXI.loader.
        add(["images/cannon/cannon.png", "images/Boat.png", "images/instructions.png", "images/cannon/cannonball.png", 
        "images/enemy/Piranha.png","images/enemy/Shark.png", "images/enemy/Barrels.png", "images/enemy/Octopus.png","images/Ocean.png",
        "images/enemy/explosion.png", "images/enemy/barrel_explosion.png"]).
		on("progress",e=>{console.log(`progress=${e.progress}`)}).
		load(setup);
    }
  });