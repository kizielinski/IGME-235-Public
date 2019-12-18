// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application(880, 530);
let gameScreen = document.querySelector("#gameScreen");
//console.log(document.querySelector("#gameScreen"));
gameScreen.appendChild(app.view);
app.backgroundColor = 0xff0000;

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// aliases
let stage;

// game variables
let startScene;
let gameScene,cannon,scoreLabel,lifeLabel, levelLabel,shootSound,hitSound,fireballSound,boat, ocean;
let gameOverScene;
let scoreScene;
let instructionScene;
let gameOverScoreLabel;
let deathTextures;
let barrelExplosionTextures
let highScore;

let enemies = [];
let piranhas = [];
let sharks = [];
let octopi = [];
let barrels = [];
let cannonBalls = [];
let explosions = [];
let barrelExplosions = [];
;
let score = 0;
let cannonArray;
let cannonCooldown = 1.25;//1.25 second cannon cooldown
let cooldown = 0; 
let life = 100;
const scoreForNewCannon = 2;
let levelNum = 1;
let numCannons = 1;

let paused = true;
let canFire = true;
let firstCannon = true;
let secondCannon = true;
let thirdCannon = true;

function setup() {
	stage = app.stage;
	// #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    //Create scoreScene and make it invisible
    scoreScene = new PIXI.Container();
    scoreScene.visible = false;
    stage.addChild(scoreScene);

    //Create the Instruction scene and make it invisible
    instructionScene = new PIXI.Container();
    instructionScene.visible = false;
    stage.addChild(instructionScene);

    // #4 - Create labels for all 5 scenes
    createLabelsAndButtons();
    
    //Create Ship
    boat = new Boat();
    gameScene.addChild(boat);

    //Create Cannon Arsenal
    cannonArray = new CannonArray();

	//Load Sounds
	shootSound = new Howl({
        src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
        src: ['sounds/hitSound.wav']
    });

    fireballSound = new Howl({
        src: ['sounds/fireball.wav']
    });

	// #7 - Load sprite sheet
    deathTextures = loadSpriteSheetEnemyDeaths();
    barrelExplosionTextures = loadSpriteSheetBarrels();
	// #8 - Start update loop
    app.ticker.add(gameLoop);
    
	// #9 - Start listening for click events on the canvas
    app.view.onclick = fireBullet;
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createLabelsAndButtons(){  
    let oceanBackground = new Ocean();
    startScene.addChild(oceanBackground);

    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Pirata One",
        stroke: 0x000000,
        strokeThickness: 6
    });

    //1 - set up 'startScene'
    //1A - make the top start label

    let startLabel1 = new PIXI.Text("         Bermuda: \nTreasure of the Sea!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64, 
        fontFamily: "Pirata One",
        stroke: 0x000000,
        strokeThickness: 6
    });

    startLabel1.x = 220;
    startLabel1.y = 80;
    startScene.addChild(startLabel1);

    //1B = make the middle start label
    let startLabel2 = new PIXI.Text("Can ye escape? ");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 54,
        fontFamily: "Pirata One",
        fontStyle: "italic",
        stroke: 0x000000,
        strokeThickness: 6
    });
    startLabel2.x = 290;
    startLabel2.y = 250;
    startScene.addChild(startLabel2);

    //1C - make the start game button
    let startButton = new PIXI.Text("Start ye Plunder");
    startButton.style = buttonStyle;
    startButton.x = 100;
    startButton.y = sceneHeight - 140;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", InstructionMenu); // startGame is a function reference
    startButton.on('pointerover',e => e.target.alpha = 0.7); // concise arrow function with no brackets
    startButton.on('pointerout',e => e.currentTarget.alpha = 1.0); //ditto
    startScene.addChild(startButton);

    //make the Score scene button
    let scoreButton = new PIXI.Text("Look at ye Yield");
    scoreButton.style = buttonStyle;
    scoreButton.x = 500;
    scoreButton.y = sceneHeight - 140 ;
    scoreButton.interactive = true;
    scoreButton.buttonMode = true;
    scoreButton.on("pointerup", ScoreScreen); 
    scoreButton.on('pointerover',e => e.target.alpha = 0.7); // concise arrow function with no brackets
    scoreButton.on('pointerout',e => e.currentTarget.alpha = 1.0); //Same thing
    startScene.addChild(scoreButton);

    //make the Score to startScreen button
    let scoreToStartButton = new PIXI.Text("Go back onto the deck");
    scoreToStartButton.style = buttonStyle;
    scoreToStartButton.x = 250;
    scoreToStartButton.y = sceneHeight - 100;
    scoreToStartButton.interactive = true;
    scoreToStartButton.buttonMode = true;
    scoreToStartButton.on("pointerup", ReturnToTitleScreen); 
    scoreToStartButton.on('pointerover',e => e.target.alpha = 0.7); // concise arrow function with no brackets
    scoreToStartButton.on('pointerout',e => e.currentTarget.alpha = 1.0); //Same thing
    scoreScene.addChild(scoreToStartButton);

    //2 - set up `gameScene`
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 36,
        fontFamily: "Pirata One",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    //2A - make score label
    ocean = new Ocean();
    gameScene.addChild(ocean);

    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 270;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    //2B - make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 80;
    lifeLabel.y = 5;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    //Make levelLabel
    levelLabel = new PIXI.Text();
    levelLabel.style = textStyle;
    levelLabel.x = 500;
    levelLabel.y = 5;
    gameScene.addChild(levelLabel);
    increaseLevel();

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Pirata One",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    //Challenge #2? 
    gameOverScoreLabel = new PIXI.Text(`Your score was: ${score}!`);
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 24,
        fontFamily: "Pirata One",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 180;
    gameOverScoreLabel.y = sceneHeight/2 + 50;
    gameOverScene.addChild(gameOverScoreLabel);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup",startGame); // startGame is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);

    //Set up score Screen
    let scoreTextStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 36,
        fontFamily: "Pirata One",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    let scoreTitleText = new PIXI.Text("High Scores!");
    scoreTitleText.style = scoreTextStyle;
    scoreTitleText.x = 340;
    scoreTitleText.y = sceneHeight/2 - 240;
    scoreScene.addChild(scoreTitleText);
    
    //Set up Instruction Screen
    let instructionTextStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 36,
        fontFamily: "Pirata One",
        stroke: 0x000000,
        strokeThickness: 4
    });

    let instructionTextStyleThin = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 22,
        fontFamily: "Pirata One",
        stroke: 0x000000,
        strokeThickness: 2
    });

    let instructions = new Instructions(440, 265);
    instructionScene.addChild(instructions);

    let instructionButton = new PIXI.Text("Continue to Battle!");
    instructionButton.style = buttonStyle;
    instructionButton.x = 290;
    instructionButton.y = sceneHeight - 100;
    instructionButton.interactive = true;
    instructionButton.buttonMode = true;
    instructionButton.on("pointerup", startGame); // startGame is a function reference
    instructionButton.on('pointerover',e => e.target.alpha = 0.7); // concise arrow function with no brackets
    instructionButton.on('pointerout',e => e.currentTarget.alpha = 1.0); //ditto
    instructionScene.addChild(instructionButton);
    //instructionScene.addChild(instructionButton);

    let instructionText = new PIXI.Text("Defend the ship at all costs!");
    instructionText.style = instructionTextStyle;
    instructionText.x = 280;
    instructionText.y = 25;
    instructionScene.addChild(instructionText);

    let instructionTextCannon = new PIXI.Text("Use your powerful cannon\nto blast away weak foes!");
    instructionTextCannon.style = instructionTextStyleThin;
    instructionTextCannon.x = 80;
    instructionTextCannon.y = 150;
    instructionScene.addChild(instructionTextCannon);

    let instructionTextBarrel = new PIXI.Text("Shoot Gunpowder barrels\nto blow up enemies!");
    instructionTextBarrel.style = instructionTextStyleThin;
    instructionTextBarrel.x = 400;
    instructionTextBarrel.y = 150;
    instructionScene.addChild(instructionTextBarrel);

    let instructionTextStartGame = new PIXI.Text("Press Left Click to Shoot\nand move your mouse to move the Cannon!");
    instructionTextStartGame.style = instructionTextStyleThin;
    instructionTextStartGame.x = 80;
    instructionTextStartGame.y = 350;
    instructionScene.addChild(instructionTextStartGame);


}

function  increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score:  ${score}`;
    //console.log(score);
}

function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Hull:    ${life}%`;
}

function increaseLevel(value){
    levelLabel.text = `Level:  ${levelNum}`;
}

function startGame(){
    console.log("Starting game!");
    startScene.visible = false;
    gameOverScene.visible = false;
    scoreScene.visible = false;
    gameScene.visible = true;
    instructionScene.visible = false;
    levelNum = 1;
    score = 0;
    life = 100;
    numCannons = 0;
    AddCannon();
    increaseScoreBy(0);
    decreaseLifeBy(0);
    cannonArray.x = 0;
    cannonArray.y = 0;
    boat.x = 25;
    boat.y = 255;
    loadLevel();
    console.log("Staring game!");
    console.log(numCannons);
    // .. more to come
}

function gameLoop(){
	if (paused) return; // keep this commented out for now
    
    //Sprite Updates
    SpriteUpdates();
	// #1 - Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
    
    CannonFireRate(dt);
	// #2 - Move Ship
	let mousePosition = app.renderer.plugins.interaction.mouse.global;
    //cannon.position = mousePosition;
    let amt = 6 * dt; // at 60 FPS would move about 10% of distance every update
    
    // lerp (linear interpolate) the x & y values with lerp()
    let newY = lerp(cannonArray.y, mousePosition.y, amt);
    let h2 = 80;
    //console.log("Cannon num : " + numCannons);
    cannonArray.y = 0;
    switch(numCannons)
    {      
        case 1:
            cannonArray.y= clamp(newY, h2, sceneHeight-h2);
            break;
        case 2:        
            cannonArray.y= clamp(newY, h2, sceneHeight-h2-100);
            break;
        case 3:
            cannonArray.y= clamp(newY, h2+100, sceneHeight-h2-100); 
            break;
    }

    // #3 - Move Enemies
	for(let c of enemies){
        c.move(dt);
        if (c.x <= c.radius || c.x >= sceneWidth-c.radius){
            //c.reflectX();
            c.move(dt);
        }

        if ((c.y <= c.radius + 80 || c.y >= sceneHeight-c.radius - 80) && (c.type != "p")){
            console.log("Reflecting!");
            c.reflectY();
            c.move(dt);
        }
    }
	
	// #4 - Move Bullets
	for (let b of cannonBalls){
		b.move(dt);
	}
	
    // #5 - Check for Collisions
    
    //Explodes barrels
    for(let b of barrels){
        for(let c of cannonBalls){
            if(rectsIntersect(b,c)){
                fireballSound.play();
                b.explode();
                b.isAlive = false;
                c.isAlive = false;
                gameScene.removeChild(c);
                gameScene.removeChild(b);
            }
        }
    }

    //Then checks enemy collision
	for(let e of enemies){
        for(let c of cannonBalls){

            //Handles Piranhas, Sharks, and Octopus collisions accordingly
            switch(e.type)
            {
                case"p":
                    //Piranhas
                    if(rectsIntersect(e,c)){
                        fireballSound.play();
                        createExplosion(e.x,e.y, 64, 64);
                        gameScene.removeChild(e);
                        e.isAlive = false;
                        // gameScene.removeChild(c);
                        // c.isAlive = false;
                        increaseScoreBy(1);
                    }
                    break;
                case"s":
                    if(rectsIntersect(e,c)){
                        if(e.health <= 0)
                        {
                            fireballSound.play();
                            createExplosion(e.x,e.y, 80, 80);
                            gameScene.removeChild(e);
                            e.isAlive = false;
                            increaseScoreBy(10);
                        }
                        else{
                            e.loseHealth();
                            gameScene.removeChild(c);
                            c.isAlive = false;
                        }
                    }
                    break;
                case"o":
                    if(rectsIntersect(e,c)){
                        if(e.health <= 0)
                        {
                            fireballSound.play();
                            createExplosion(e.x,e.y, 80, 80);
                            gameScene.removeChild(e);
                            e.isAlive = false;
                            increaseScoreBy(50);
                        }
                        else{
                            e.loseHealth();
                            gameScene.removeChild(c);
                            c.isAlive = false;
                        }
                    }
                    break;
                default:
                    break;
            }
            
            //cannonBalls disappear after moving off screen.
            if(c.x > sceneWidth + 35) {
                c.isAlive = false;
            }
        }

        for(let b of barrelExplosions){            
            if(rectsIntersect(b, e)){
                fireballSound.play();
                gameScene.removeChild(e);
                increaseScoreBy(1);
                e.isAlive = false;
            }   
        }
        //Enemies and Boat
        if(e.isAlive && rectsIntersect(e,boat)){
            hitSound.play();
            gameScene.removeChild(e);
            e.isAlive = false;
            decreaseLifeBy(e.damage);
        }      
    }

    let cannonRemove;
    for(let e of enemies){
        //Enemies and Cannon
        for(let c of cannonArray.cannons)
        {
            if(e.isAlive && rectsIntersect(e,c)){
                hitSound.play();
                e.health = 0;
                c.loseHealth();         
            }
        }       
    }  
	
    // #6 - Now do some clean up
    for(let c of cannonArray.cannons)
    {
        if(c.health == 0 && cannonArray.cannons.length >= 1){
            c.isOperable = false;
            cannonArray.removeChild(c);
            gameScene.removeChild(c);
            numCannons = numCannons -1;      
        }
    }
    
    for(let e of enemies){
        if(e.health == 0){
            e.isAlive = false;
            gameScene.removeChild(e);
        }
    }
    //get rid of cannons
    cannonArray.cannons = cannonArray.cannons.filter(c=>c.isOperable);
    //console.log(cannonArray.cannons);
    // get rid of dead bullets
    cannonBalls = cannonBalls.filter(c=>c.isAlive);

    // get rid of dead piranhas
    enemies = enemies.filter(c=>c.isAlive);
    
    //get rid of explosions
    explosions = explosions.filter(e=>e.playing);
    barrelExplosions = barrelExplosions.filter(e=>e.playing);

    barrels = barrels.filter(b=>b.isAlive);
    
    // #7 - Is game over?
    console.log(numCannons);
    if (life <= 0 || numCannons == 0){
        end();
        return; // return here so we skip #8 below
    }
	
    // #8 - Load next
    if(enemies.length == 0){
        levelNum++;
        loadLevel();
        increaseLevel();
    }

    //Add Cannons if neccesary
    if(numCannons <=3)
    {      
        AddCannon();
    }

}

function createPiranha(numPiranha){
    for(let i=0; i<numPiranha; i++){
        let c = new Piranha(10, 0xFFFF00);
        c.x = Math.random() * (sceneWidth - 50) + sceneWidth;
        c.y = Math.random() * (sceneHeight-160) + 80;
        piranhas.push(c);
        gameScene.addChild(c);
    }
}

function createShark(numShark){
    for(let i=0; i<numShark; i++){
        let c = new Shark(10);
        c.x = sceneWidth - 50;
        c.y = Math.random() * (sceneHeight-180) + 80;
        sharks.push(c);
        gameScene.addChild(c);
    }
}

function createOctopus(numOctopus){
    for(let i=0; i<numOctopus; i++){
        let c = new Octopus(15);
        octopi.push(c);
        gameScene.addChild(c);
    }
}

function createBarrel(numBarrel){
    for(let i=0; i<numBarrel; i++){
        let c = new Barrel(5);
        barrels.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel(){
    createPiranha(levelNum * 2);
    createShark(levelNum-1 * 1);
    if(levelNum >= 3)
    {
        createOctopus(levelNum-2);
    }   
    createBarrel(levelNum * 2);
    AssembleEnemies();
    paused = false;
}

function end(){
    paused = true;
    //clear out level
    enemies.forEach(e=>gameScene.removeChild(e)); //simple arrow function w no return
    enemies = [];
    piranhas = [];
    sharks = [];
    octopi = [];
    
    barrels.forEach(b=>gameScene.removeChild(b))
    barrels = [];
    cannonBalls.forEach(c=>gameScene.removeChild(c)); 
    cannonBalls = [];

    cannonArray.cannons.forEach(g=>gameScene.removeChild(g));
    for(let c of cannonArray.cannons)
    {  
        //cannonArray.removeChild(c);
        gameScene.removeChild(c);
    }

    cannonArray.cannons = [];

    explosions.forEach(e=>gameScene.removeChild(e));
    explosions = [];

    gameOverScene.visible = true;
    gameScene.visible = false;

    firstCannon = true;
    secondCannon = true;
    thirdCannon = true;
}

function fireBullet(e){
    // let rect = app.view.getBoundingClientRect();
    //let mouseX = e.clientX - rect.x;
    // let mouseY = e.clientY - rect.y;
    // console.log(`${mouseX}, ${mouseY}`);
    if (paused) return;
    
    if(canFire == true)
    {
        for(let c of cannonArray.cannons)
        {
            if(c.isOperable == true)
            {
                let b = new Bullet(0xFFFFFF, c.x, cannonArray.y + c.y, levelNum);
                cannonBalls.push(b);
                gameScene.addChild(b);
                shootSound.play();
                canFire = false;
            }
        }
    }
}

//Loads enemy death explosion spritesheet
function loadSpriteSheetEnemyDeaths(){
    // the 16 animation frames in each row are 64x64 pixels
    // we are using the second row
    // https://pixijs.download/dev/docs/PIXI.BaseTexture.html

    let spriteSheet = PIXI.BaseTexture.fromImage("images/enemy/explosion.png");
    let width = 64;
    let height = 64;
    let numFrames = 10;
    let textures = [];
    for(let i=0; i<numFrames;i++){
        //http://pixijs.download/dev/docs/PIXI.Texture.html
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 0, width, height));
        textures.push(frame);
    }
    console.log(textures);
    return textures;
}

//Loads barrel explosion spritesheet
function loadSpriteSheetBarrels(){
    // the 16 animation frames in each row are 64x64 pixels
    // we are using the second row
    // https://pixijs.download/dev/docs/PIXI.BaseTexture.html

    let spriteSheet = PIXI.BaseTexture.fromImage("images/enemy/barrel_explosion.png");
    let width = 128;
    let height = 128;
    let numFrames = 16;
    let textures = [];
    for(let i=0; i<numFrames;i++){
        //http://pixijs.download/dev/docs/PIXI.Texture.html
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 0, width, height));
        textures.push(frame);
    }
    console.log(textures);
    return textures;
}

//Creates a normal simple explosion for enemy deaths
function createExplosion(x,y,frameWidth,frameHeight){
    // http://pixijs.download/dev/docs/PIXI.extras.AnimatedSprite.html
    // these animations have frames that are 64x64 px
    let w2 = frameWidth/2;
    let h2 = frameHeight/2;
    let expl = new PIXI.extras.AnimatedSprite(deathTextures);

    //makes explosions appear at center of piranha
    expl.x = x - w2; 
    expl.y = y - h2;

    expl.animationSpeed = 2/7;
    expl.loop = false;
    expl.onComplete = e=>gameScene.removeChild(expl);
    explosions.push(expl)
    gameScene.addChild(expl);
    expl.play();
}

//Creates an explosion using barrle explosion sprite
function createBarrelExplosion(x,y,frameWidth,frameHeight){
    // http://pixijs.download/dev/docs/PIXI.extras.AnimatedSprite.html
    // these animations have frames that are 64x64 px
    let w2 = frameWidth/2;
    let h2 = frameHeight/2;
    let expl = new PIXI.extras.AnimatedSprite(barrelExplosionTextures);

    //makes explosions appear at center of piranha
    expl.x = x - w2-12; 
    expl.y = y - h2-12;

    expl.animationSpeed = 1/3;
    expl.loop = false;
    expl.onComplete = e=>gameScene.removeChild(expl);
    barrelExplosions.push(expl)
    gameScene.addChild(expl);
    expl.play();
}

//Assembles all enemies into one array for ease of access.
function AssembleEnemies()
{

    for(let p in piranhas)
    {
        enemies.push(piranhas[p]);
    }

    for(let s in sharks)
    {
        enemies.push(sharks[s]);
    }

    for(let o in octopi){
        enemies.push(octopi[o]);
    }
    //console.log(octopi);
}

//Limits the player's fire rate so the cannon shoots slower like a real cannon
function CannonFireRate(dt)
{
    cooldown = cooldown -  dt;
    if(cooldown <= 0)
    {
        cooldown = cooldown + cannonCooldown;
        canFire = true;
    }
}

//Adds more cannons as player increases their score
function AddCannon()
{
    //HardVersion

    if(numCannons == 0 && score == 0 && firstCannon)
    {
        // Create cannon
        cannon = new Cannon("first"); 
        cannon.x = 30;
        cannonArray.cannons.push(cannon);
        gameScene.addChild(cannon);
        cannonArray.addChild(cannon);
        gameScene.addChild(cannonArray);
        numCannons++;
        firstCannon = false;
    }
    else if(score > 50 && secondCannon)
    {      
        let cannon2 = new Cannon("second"); 
        cannon2.x = 30;
        cannon2.y = 120;
        cannonArray.cannons.push(cannon2);
        console.log(cannonArray.cannons);
        gameScene.addChild(cannon2);
        cannonArray.addChild(cannon2);
        numCannons ++;
        console.log(numCannons);
        secondCannon = false;
    }
    else if(score > 100 && thirdCannon)
    {
        let cannon3 = new Cannon("third"); 
        cannon3.x = 30;
        cannon3.y = -120;
        cannonArray.cannons.push(cannon3);
        //console.log(cannonArray.cannons);
        gameScene.addChild(cannon3);
        cannonArray.addChild(cannon3);
        numCannons ++;
        thirdCannon = false;
    }
}

//Update sprites of ship as it takes damage
function SpriteUpdates()
{
    //console.log(boat.texture.textureCacheIds);
    let shipCondition = 0;
    if(life > 80)
    {
        shipCondition = 0;
    }
    else if(life > 60 && life < 80)
    {
        shipCondition = 1;
    }
    else if(life > 40 && life < 60)
    {
        shipCondition = 2;
    }
    else if(life > 20 && life < 40)
    {
        shipCondition = 3;
    }
    else if(life > 0 && life < 20)
    {
        shipCondition = 4;
    }
    switch(shipCondition)
    {
        case 0:
            boat.texture = PIXI.Texture.fromImage("images/Boat_Start/boat_0.png");
            break;
        case 1:
        boat.texture = PIXI.Texture.fromImage("images/Boat_Start/boat_1.png");
            break;
        case 2:
        boat.texture = PIXI.Texture.fromImage("images/Boat_Start/boat_2.png");
            break;
        case 3:
        boat.texture = PIXI.Texture.fromImage("images/Boat_Start/boat_3.png");
            break;
        case 4:
        boat.texture = PIXI.Texture.fromImage("images/Boat_Start/boat_4.png");
            break;
    }
}

//Brings user to high score screen
function ScoreScreen()
{
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    scoreScene.visible = true;
    instructionScene.visible = false;
}

//Returns user to title screen
function ReturnToTitleScreen()
{
    startScene.visible = true;
    gameOverScene.visible = false;
    gameScene.visible = false;
    scoreScene.visible = false;
    instructionScene.visible = false;
}

//Opens instruction menu
function InstructionMenu(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    scoreScene.visible = false;
    instructionScene.visible = true;
}

