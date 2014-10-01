// Initialize Phaser, and creates a 400x490px game
//var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

/*
//hack to work on multiple screen sizes... i didnt have much luck
var w = window.innerWidth * window.devicePixelRatio,
h = window.innerHeight * window.devicePixelRatio,
width = (h > w) ? h : w,
height = (h > w) ? w : h;

// Hack to avoid iPad Retina and large Android devices. Tell it to scale up.
if (window.innerWidth >= 1024 && window.devicePixelRatio >= 2)
    {
        width = Math.round(width / 2);
        height = Math.round(height / 2);
    }

// reduce screen size by one 3rd on devices like Nexus 5
if (window.devicePixelRatio === 3)
    {
        width = Math.round(width / 3) * 2;
        height = Math.round(height / 3) * 2;
    }
*/

var game = new Phaser.Game(400, 490, Phaser.CANVAS, 'gameDiv');


// Creates a new 'main' state that will contain the game
var mainState = {
    
    // Function called first to load all the assets
    preload: function() { 
        
        //set double jump
        this.jump_set = 3;
        // Change the background color of the game
        game.stage.backgroundColor = '#71c5cf';

        // Load the player sprite
        game.load.spritesheet('player', 'assets/player.png', 32, 48);  

        // Load the platform sprite
        game.load.image('platform', 'assets/platform.png');    
		
		// Load the cloud sprite
        game.load.image('cloud', 'assets/cloud.png'); 
        
        //load the lava
        game.load.image('lava', 'assets/lava.png');
        
        //load the boundry wall
        //game.load.image('wall', 'assets/wall.png');
    },

    // Function called after 'preload' to setup the game 
    create: function() { 
        
        //set scaling
        //game.scale.hasResized.add(function() { window.AutoScaler('romeocat-game', 960, 600); });
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;    
        game.scale.setShowAll();
        game.scale.setScreenSize(true);
        game.scale.refresh();
        
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Call the 'jump' function when the spacekey is hit (not used in this game)
        //var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        //this works for clicking mouse and touching a screen
        this.input.onDown.add(this.jump, this);
        
        //none of this shit works for phone touch events
        //game.input.isDown.add(this.jump, this);
        //spaceKey.onDown.add(this.jump, this); 
        //this.onTap.add(this.jump, this);

        // Create a group of 20 platforms
        this.platforms = game.add.group();
        this.platforms.enableBody = true;
        this.platforms.createMultiple(20, 'platform');

		// Create a group of clouds
        this.clouds = game.add.group();
        this.clouds.enableBody = true;
        this.clouds.createMultiple(20, 'cloud');		
        
        //create the starting platform
        this.starting = this.platforms.create(50, 400, 'platform')
        this.starting.body.immovable = true;

        // Timer that calls 'addRowOfplatforms' every x milliseconds
        this.timer = this.game.time.events.loop(1300, this.addRowOfplatforms, this);  
		
		// Timer that calls 'addRowOfplatforms' every x milliseconds
        this.timer = this.game.time.events.loop(1300, this.addRowOfclouds, this); 
        
        //create the lava group
        this.lava = game.add.group();
        this.lava.enableBody = true;
        this.floor = this.lava.create(0,465, 'lava')

        //create a boundry to push the player
       // this.wall = game.add.group();
        //this.wall.enableBody = true;
        //this.boundry = this.wall.create(-25,0, 'wall')
        
        // Add a score label on the top left of the screen
        this.score = 0;
        this.labelScoretxt = this.game.add.text(20, 10, "Score", { font: "30px Arial", fill: "#ffffff" });  
        this.labelScore = this.game.add.text(50, 40, "0", { font: "30px Arial", fill: "#ffffff" });  
        this.labelScore.anchor.setTo(0.1, 0.1);
        
        //show number of jumps left in top right of the screen
        this.labelJumps = this.game.add.text(340, 40, "0", { font: "30px Arial", fill: "#ffffff" }); 
        this.labelJumpstxt = this.game.add.text(300, 10, "Jumps", { font: "30px Arial", fill: "#ffffff" });  
        this.labelJumps.text = this.jump_set;
		
		// Display the player on the screen
        this.player = this.game.add.sprite(100, 100, 'player');
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);
        
        // Add gravity to the player to make it fall
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 400; 
    },

    // This function is called 60 times per second
    update: function() {
        // If the player is out of the world (too high or too low), call the 'restartGame' function
         if (this.player.inWorld == false)
            this.restartGame(); 

        // If the player overlaps the lava, call 'restartGame'
        game.physics.arcade.overlap(this.player, this.lava, this.restartGame, null, this);      
        game.physics.arcade.collide(this.player, this.platforms);
        game.physics.arcade.collide(this.player, this.starting);
        
        //make starting platform fall if hit by another platform
        game.physics.arcade.collide(this.starting, this.platforms, this.platfall, null, this);

        
        //animate the player
        this.player.animations.play('right');
        
        //debug to find height of player
        //console.log(this.player.y)
        
    },

    // Make the player jump 
    jump: function() {
        // Add a vertical velocity to the player
        if (this.player.body.touching.down || this.jump_set > 0)
        {
            this.player.body.velocity.y = -250;
            this.jump_set -= 1;
            this.labelJumps.text = this.jump_set;
            
        }
        
        //if the player touches a block, add one to the score
        //reset the double jump
        if (this.player.body.touching.down && this.player.y < 352)
        {
            //scoring based on height of platform (not used)
            //this.score += parseInt(1 * (this.player.body.y / 100));
            //scoring based on how many platforms jumped
            this.score += 1;
            this.jump_set = 3;
            this.labelJumps.text = this.jump_set;
            this.labelScore.text = this.score;
            if (this.score === 1)
            {
                this.platfall();
            }
            //if the score is double digits, move the counter over
            if (this.score > 9)
            {
                this.labelScore.destroy();
                this.labelScore = this.game.add.text(40, 40, this.score, { font: "30px Arial", fill: "#ffffff" });
            }
        }
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },
    
    platfall: function() {
	//make sure the starting platform can fall
        this.starting.body.immovable = false;
    },

    // Add a platform on the screen
    addOneplatform: function(x, y) {
        // Get the first dead platform of our group
        var platform = this.platforms.getFirstDead();

        // Set the new position of the platform
        platform.reset(x, y);

        // Add velocity to the platform to make it move left
        platform.body.velocity.x = (-250 - (this.score * 10)); 
               
        // Kill the platform when it's no longer visible 
        platform.checkWorldBounds = true;
        platform.outOfBoundsKill = true;
    },

    // Add a platform at a random height
    addRowOfplatforms: function() {
        this.addOneplatform(450, (Math.random()*(350-250) + 250));
    },
	
	// Add a cloud on the screen
    addOneCloud: function(x, y) {
		console.log(x);
		console.log(y);
        // Get the first dead cloud of our group
        var clouds = this.clouds.getFirstDead();

        // Set the new position of the platform
        clouds.reset(x, y);

        // Add velocity to the cloud to make it move left
        clouds.body.velocity.x = (-200); 
               
        // Kill the cloud when it's no longer visible 
        clouds.checkWorldBounds = true;
        clouds.outOfBoundsKill = true;
    },

    // Add a cloud at a random height
    addRowOfclouds: function() {
        this.addOneCloud(500, (Math.random()*(150-10) + 10));
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main'); 