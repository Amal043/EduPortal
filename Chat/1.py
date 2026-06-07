import turtle
import random
import time

screen = turtle.Screen()
screen.title("Decorative Santa — Merry Christmas Turtle Art")
screen.bgcolor("#001a2d")

pen = turtle.Turtle()
pen.speed(10)
pen.pensize(3)

def go(x, y):
    pen.up()
    pen.goto(x, y)
    pen.down()

# -------- SNOW BACKGROUND --------
snow = turtle.Turtle()
snow.hideturtle()
snow.color("white")
snow.speed(0)

for i in range(120):
    snow.penup()
    snow.goto(random.randint(-400, 400), random.randint(-300, 300))
    snow.dot(random.randint(2, 5))

# -------- FESTIVE BORDER LIGHTS --------
lights = turtle.Turtle()
lights.speed(0)
lights.width(2)
lights.color("gold")

go(-450, 260)
for i in range(2):
    lights.forward(900)
    lights.right(90)
    lights.forward(520)
    lights.right(90)

for i in range(-430, 440, 35):
    lights.penup()
    lights.goto(i, 255)
    lights.pendown()
    lights.dot(10, random.choice(["red","yellow","lime","cyan","magenta"]))

for i in range(-430, 440, 35):
    lights.penup()
    lights.goto(i, -255)
    lights.pendown()
    lights.dot(10, random.choice(["red","yellow","lime","cyan","magenta"]))

# -------- DRAW SANTA --------
def santa_hat():
    pen.color("red")
    go(-70, 120)
    pen.begin_fill()
    pen.setheading(60)
    pen.circle(120, 120)
    pen.setheading(-60)
    pen.forward(140)
    pen.end_fill()

    # Hat border
    pen.color("white")
    go(-85, 115)
    pen.begin_fill()
    pen.setheading(0)
    pen.forward(170)
    pen.setheading(-180)
    pen.circle(40, 180)
    pen.end_fill()

    # Pom Pom
    go(75, 190)
    pen.begin_fill()
    pen.circle(20)
    pen.end_fill()

def santa_face():
    pen.color("#ffddb3")
    go(0, 40)
    pen.begin_fill()
    pen.circle(90)
    pen.end_fill()

def eyes():
    pen.color("black")
    for x in (-35, 35):
        go(x, 95)
        pen.begin_fill()
        pen.circle(10)
        pen.end_fill()

def nose():
    pen.color("#ff6666")
    go(0, 70)
    pen.begin_fill()
    pen.circle(12)
    pen.end_fill()

def mustache():
    pen.color("white")
    go(-45, 50)
    pen.begin_fill()
    pen.setheading(-20)
    pen.circle(45, 200)
    pen.setheading(0)
    pen.circle(45, 200)
    pen.end_fill()

def beard():
    pen.color("white")
    go(-80, 20)
    pen.begin_fill()
    pen.setheading(-70)
    for i in range(50):
        pen.forward(5)
        pen.right(3)
    pen.setheading(-110)
    for i in range(50):
        pen.forward(5)
        pen.left(3)
    pen.end_fill()

def smile():
    pen.color("black")
    go(-35, 60)
    pen.setheading(-60)
    pen.circle(40, 120)

# -------- SIDE TEXT ANIMATION --------
def side_christmas_text():
    txt = turtle.Turtle()
    txt.hideturtle()
    txt.color("#00ffcc")
    txt.penup()
    txt.goto(230, 120)

    message = "🎄 Merry Christmas 🎄"
    for i in range(len(message)):
        txt.write(message[:i+1], font=("Comic Sans MS", 26, "bold"))
        time.sleep(0.08)
        txt.clear()

    txt.color("gold")
    txt.write(message, font=("Comic Sans MS", 30, "bold"))

    # Sub-text
    txt.goto(260, 60)
    txt.color("#ff6666")
    txt.write("Wishing You Joy & Happiness",
              font=("Arial", 16, "italic"))

# -------- DRAW EVERYTHING --------
santa_hat()
santa_face()
eyes()
nose()
mustache()
beard()
smile()

side_christmas_text()

turtle.done()

