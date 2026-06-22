const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Food {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
  }
  draw() {
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x, this.y, 3, 3);
  }
}

class Creature {
  constructor(x, y, speed = 1.5, energy = 100, color = "cyan") {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.energy = energy;
    this.color = color;
  }

  move() {
    this.x += (Math.random() - 0.5) * this.speed;
    this.y += (Math.random() - 0.5) * this.speed;

    this.energy -= 0.1;

    if (this.energy <= 0) {
      creatures.splice(creatures.indexOf(this), 1);
    }
  }

  eat(foodList) {
    foodList.forEach((f, i) => {
      if (Math.hypot(this.x - f.x, this.y - f.y) < 10) {
        this.energy += 40;
        foodList.splice(i, 1);
      }
    });
  }

  reproduce() {
    if (this.energy > 200) {
      this.energy -= 100;
      creatures.push(
        new Creature(
          this.x,
          this.y,
          this.speed + (Math.random() - 0.5) * 0.2,
          100,
          this.color
        )
      );
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

let creatures = [];
let food = [];

for (let i = 0; i < 20; i++) {
  creatures.push(new Creature(Math.random() * canvas.width, Math.random() * canvas.height));
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (Math.random() < 0.05) food.push(new Food());

  food.forEach(f => f.draw());

  creatures.forEach(c => {
    c.move();
    c.eat(food);
    c.reproduce();
    c.draw();
  });

  requestAnimationFrame(loop);
}

loop();

