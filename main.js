// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

//set double jump
this.jump_set = 0;

// Creates a new 'main' state that will contain the game
var mainState = {

    // Function called first to load all the assets
    preload: function() { 
        // Change the background color of the game
        game.stage.backgroundColor = '#71c5cf';

        // Load the player sprite
        game.load.spritesheet('player', 'assets/player.png', 32, 48);  

        // Load the platform sprite
        game.load.image('platform', 'assets/platform.png');    
        
        //load the lava
        game.load.image('lava', 'assets/lava.png');
        
        //load the boundry wall
        //game.load.image('wall', 'assets/wall.png');
    },

    // Fuction called after 'preload' to setup the game 
    create: function() { 
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the player on the screen
        this.player = this.game.add.sprite(100, 100, 'player');
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);
        
        // Add gravity to the player to make it fall
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 350; 

        // Call the 'jump' function when the spacekey is hit (or mouse click or screen tap)
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
       // game.input.onDown.add(this.jump, this);
        this.input.onDown.add(this.jump, this);
        //game.input.isDown.add(this.jump, this);
        //spaceKey.onDown.add(this.jump, this); 
        //this.onTap.add(this.jump, this);
       // if this.target.activePointer.isDown
        //{
        //    this.jump, this;
       // }

        // Create a group of 20 platforms
        this.platforms = game.add.group();
        this.platforms.enableBody = true;
        this.platforms.createMultiple(20, 'platform'); 
        
        //create the starting platform
        this.starting = this.platforms.create(50, 150, 'platform')

        // Timer that calls 'addRowOfplatforms' every 1.5 seconds
        this.timer = this.game.time.events.loop(1500, this.addRowOfplatforms, this);  
        
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
        this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  
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
        //platform.body.drag.setTo(10000);
        
        //animate the player
        this.player.animations.play('right');
    },

    // Make the player jump 
    jump: function() {
        // Add a vertical velocity to the player
        if (this.player.body.touching.down || this.jump_set === 0)
        {
            this.player.body.velocity.y = -250;
            this.jump_set = 1;
        }
        
        //if the player touches a block, add one to the score
        //reset the double jump
        if (this.player.body.touching.down || this.jump_set === 0)
        {
            this.score += 1;
            this.jump_set = 0;
            this.labelScore.text = this.score;
        }
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    // Add a platform on the screen
    addOneplatform: function(x, y) {
        // Get the first dead platform of our group
        var platform = this.platforms.getFirstDead();

        // Set the new position of the platform
        platform.reset(x, y);

        // Add velocity to the platform to make it move left
        platform.body.velocity.x = (-250 - (this.score * 2)); 
               
        // Kill the platform when it's no longer visible 
        platform.checkWorldBounds = true;
        platform.outOfBoundsKill = true;
    },

    // Add a row of 6 platforms with a hole somewhere in the middle
    addRowOfplatforms: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < 1; i++)
            if (i != hole && i != hole +1 && i != hole -1) 
                //(pop-in distance to next platform, i*height+starting coordinate)
                //this.addOneplatform(400, i*60+200);   
                this.addOneplatform(400, i*60+(Math.random()*(450-300) + 300));
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main'); 