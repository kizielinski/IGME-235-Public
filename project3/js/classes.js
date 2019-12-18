class Cannon extends PIXI.Sprite{
    constructor(name="bob"){
        super(PIXI.loader.resources["images/cannon/cannon.png"].texture);
        this.anchor.set(.5,.5); // position, scaling, rotating etc are now from center of sprite
        this.scale.set(1);
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.health = 3;
        this.isOperable = true;
        this.name = name;
        this.isDamageable = true;
    }

    loseHealth()
    {
        this.health = this.health -1;
        console.log(this.name + this.health);
    }
}

class CannonArray extends PIXI.Sprite{
    constructor(x=0, y=0){
        super();
        // this.beginFill(color);
        // this.drawCircle(0,0,1);
        // this.endFill();
        this.anchor.set(.5,.5);
        this.x = x;
        this.y = y;
        this.cannonCount = 1;
        this.cannons = [];
    }
}

class Boat extends PIXI.Sprite{
    constructor(x=0, y=0){
        super(PIXI.loader.resources["images/Boat.png"].texture);
        // position, scaling, rotating etc are now from center of sprite
        this.anchor.set(.5,.5); 
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.rotation = 0;
    }
}

class Ocean extends PIXI.Sprite{
    constructor(x=0, y=0){
        super(PIXI.loader.resources["images/Ocean.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(1);
        this.x = 440;
        this.y = 265;
        this.rotation = 0;
    }
}
class Piranha extends PIXI.Sprite{
    constructor(radius, color = 0xFF0000, x = 0, y = 0){
        super(PIXI.loader.resources["images/enemy/Piranha.png"].texture);
        this.anchor.set(.5,.5); 
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.radius = radius;
        //variables
        this.fwd = getRandomUnitVector();
        this.fwd.x = -1;
        this.fwd.y = 0;
        this.speed = 120;//getRandom(30, 50);
        this.isAlive = true;
        this.health = 1;
        this.damage = 1;
        //Type
        this.type = "p";
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

class Shark extends PIXI.Sprite{
    constructor( x = 0, y = 0){
        super(PIXI.loader.resources["images/enemy/Shark.png"].texture);
        this.anchor.set(.5,.5); 
        this.scale.set(1);
        this.x = x;
        this.y = y;
        //variables
        this.fwd = getRandomUnitVector();
        this.fwd.x = -1;
        this.fwd.y = getRandom(-0.1, 0.1);
        this.speed = 50;
        this.isAlive = true;
        this.health = 2;
        this.damage = 5;
        //Type
        this.type = "s";
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    loseHealth()
    {
        this.health = this.health -1;
        console.log(this.health);
    }

    reflectY(){
        this.fwd.y *= -1;
    }
}

class Octopus extends PIXI.Sprite{
    constructor(radius, color = 0xFFFF00, x = 0, y = 0){
        super(PIXI.loader.resources["images/enemy/Octopus.png"].texture);
        this.anchor.set(.5,.5); 
        this.scale.set(1);
        this.x = getRandom(sceneWidth - 100, sceneWidth);
        this.y = Math.random() * (340) + 90;
        this.radius = radius;
        //variables
        this.fwd = getRandomUnitVector();
        this.fwd.x = -1;
        this.fwd.y = getRandom(-2,2);
        this.speed = 30;
        this.isAlive = true;
        this.health = 5;
        this.damage = 10;
        //Type
        this.type = "o";
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectY(){
        this.fwd.y *= -1;
    }
    
    loseHealth()
    {
        this.health = this.health -1;
        console.log(this.health);
    }
}

class Barrel extends PIXI.Sprite{
    constructor(radius, color = 0xfcf000, x = 0, y = 0){
        super(PIXI.loader.resources["images/enemy/Barrels.png"].texture);
        this.scale.set(1);
        this.x = getRandom(300, 400);
        this.y = Math.random() * (sceneHeight-160) + 80;
        this.radius = radius;
        this.isAlive = true;
        this.explosionOver = false;
        this.dmg = 10;
        this.timer = 0;
    }

    explode(){
        createBarrelExplosion(this.x,this.y, 64, 64);
        this.isAlive = false;
    }

    timeAdd()
    {
        this.timer = this.timer +  1;
    }
}

class Bullet extends PIXI.Sprite{
    constructor(color=0xFFFFFF, x = 0, y = 0, levelNum = 0){
        super(PIXI.loader.resources["images/cannon/cannonball.png"].texture);
        this.anchor.set(.5,.5); // position, scaling, rotating etc are now from center of sprite
        this.scale.set(1);
        this.x = x + 30;
        this.y = y;
        //variables
        this.fwd = {x:1, y:0};
        this.speed = 140;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

class Instructions extends PIXI.Sprite{
    constructor(x=0, y=0){
        super(PIXI.loader.resources["images/instructions.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(1);
        this.x = x;
        this.y = y;
    }
}