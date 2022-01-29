export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        }
    };

    const observers = []

    function start() {
        const frequency = 2000

        setInterval(addFruit, frequency)
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function unSubscribeAll() {
        observers = []
    }

    function notifyAll(command) {
        console.log(`Notifying ${observers.length} observers.`)

        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function setState(newState) {
        Object.assign(state, newState)
    }

    function addPlayer(command) {
        const {
            playerId
        } = command
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)

        state.players[playerId] = {
            x: playerX,
            y: playerY
        }

        notifyAll({
            type: 'add-player',
            playerId,
            playerX,
            playerY
        })
    }

    function removePlayer(command) {
        const {
            playerId
        } = command

        delete state.players[playerId]

        notifyAll({
            type: 'remove-player',
            playerId
        })
    }

    function addFruit(command) {
        const {
            fruitId,
            fruitX,
            fruitY
        } = command ?? {
            fruitId: Math.floor(Math.random() * 1000000),
            fruitX: Math.floor(Math.random() * state.screen.width),
            fruitY: Math.floor(Math.random() * state.screen.height)
        }

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: 'add-fruit',
            fruitId,
            fruitX,
            fruitY
        })
    }

    function removeFruit(command) {
        const {
            fruitId
        } = command

        delete state.fruits[fruitId]

        notifyAll({
            type: 'remove-fruit',
            fruitId
        })
    }

    function movePlayer(command) {
        console.log(`Moving ${command.playerId} with ${command.keyPressed}`)
        notifyAll(command)

        const acceptMoves = {
            ArrowUp(player) {
                console.log('Moving player Up')
                player.y = Math.max(player.y - 1, 0)
            },
            ArrowRight(player) {
                console.log('Moving player Right')
                player.x = Math.min(player.x + 1, state.screen.width - 1)

            },
            ArrowDown(player) {
                console.log('Moving player Down')
                player.y = Math.min(player.y + 1, state.screen.height - 1)
            },
            ArrowLeft(player) {
                console.log('Moving player Left')
                player.x = Math.max(player.x - 1, 0)
            }
        }

        const keyPressed = command.keyPressed
        const player = state.players[command.playerId]
        const {
            playerId
        } = command
        const moveFunction = acceptMoves[keyPressed]

        if (player && moveFunction) {
            moveFunction(player)
            checkFruitCollision(playerId)
        }

        function checkFruitCollision(playerId) {
            const player = state.players[playerId]

            for (const fruitId in state.fruits) {
                const fruit = state.fruits[fruitId]
                console.log(`Checking ${playerId} and ${fruitId}`);

                if (player.x === fruit.x && player.y === fruit.y) {
                    console.log(`Collision between ${playerId} and ${fruitId}`);
                    removeFruit({
                        fruitId
                    })
                }
            }
        }
    }

    return {
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        movePlayer,
        setState,
        subscribe,
        unSubscribeAll,
        start,
        state
    }
}