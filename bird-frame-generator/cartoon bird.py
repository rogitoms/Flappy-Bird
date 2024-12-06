import cairo

# Canvas dimensions
WIDTH, HEIGHT = 200, 200

# Function to draw the bird
def draw_bird(ctx, wing_angle):
    """
    Draws a cartoonish bird with intricate Bezier curves.

    Parameters:
        ctx: The Pycairo context.
        wing_angle: The angle of the wings for animation.
    """
    # Center the bird on the canvas
    ctx.translate(WIDTH // 2, HEIGHT // 2)

    # Draw the body
    ctx.set_source_rgb(1, 0.8, 0.2)  # Bright yellow body
    ctx.move_to(-60, 0)
    ctx.curve_to(-45, -55, 45, -55, 60, 0)  # upper curve
    ctx.move_to(-60,0)
    ctx.curve_to(-45, 55, 45, 55, 60, 0)  # lower curve
    ctx.fill()
    ctx.set_source_rgb(0, 0, 0)  # Bright yellow body
    ctx.move_to(-60, 0)
    ctx.curve_to(-45, -55, 45, -55, 60, 0)  # upper curve
    ctx.move_to(-60, 0)
    ctx.curve_to(-45, 55, 45, 55, 60, 0)  # lower curve
    ctx.set_line_width(0.8)
    ctx.stroke()

    # Draw the wing
    ctx.set_source_rgb(1, 0.6, 0.1)  # Orange wing
    ctx.save()
    ctx.rotate(wing_angle)  # Rotate for dynamic positioning
    ctx.move_to(0, -40)
    ctx.line_to(-40,-70)
    # ctx.line_to(-25,-10)
    ctx.line_to(-25,-10)
    ctx.line_to(10,0)
    ctx.fill()
    ctx.restore()
    ctx.set_source_rgb(0, 0, 0)  # Orange wing
    ctx.save()
    ctx.rotate(wing_angle)  # Rotate for dynamic positioning
    ctx.move_to(0, -40)
    ctx.line_to(-40, -70)
    # ctx.line_to(-25,-10)
    ctx.line_to(-25, -10)
    ctx.line_to(10, 0)
    ctx.close_path()
    ctx.set_line_width(0.8)
    ctx.stroke()
    ctx.restore()

    # Draw the Upper beak
    ctx.set_source_rgb(1, 0.5, 0)  # Dark orange beak
    ctx.move_to(45, -15)
    ctx.line_to(40, 4)
    # ctx.line_to(45, 15)
    ctx.line_to(70, 4)
    # ctx.close_path()
    ctx.fill()
    ctx.set_source_rgb(0, 0, 0)  # Dark orange beak
    ctx.move_to(45, -15)
    ctx.line_to(40, 4)
    # ctx.line_to(45, 15)
    ctx.line_to(70, 4)
    ctx.close_path()
    ctx.set_line_width(0.8)
    ctx.stroke()
    # stroke
    ctx.set_source_rgb(0,0,0)
    ctx.move_to(70,4)
    ctx.line_to(45,4)
    ctx.set_line_width(0.8)
    ctx.stroke()


    # draw lower beak
    ctx.set_source_rgb(1, 0.5, 0)  # Dark orange beak
    ctx.move_to(60,4)
    ctx.line_to(45, 15)
    ctx.line_to(40,4)
    ctx.fill()
    ctx.set_source_rgb(0, 0, 0)  # Dark orange beak
    ctx.move_to(60, 4)
    ctx.line_to(45, 15)
    ctx.line_to(40, 4)
    ctx.close_path()
    ctx.set_line_width(0.8)
    ctx.stroke()


    # Draw the eye
    ctx.set_source_rgb(1, 1, 1)  # White eye
    ctx.arc(30, -20, 7, 0, 2 * 3.14159)  # Outer eye
    ctx.fill()
    ctx.set_source_rgb(0, 0, 0)  # White eye
    ctx.arc(30, -20, 7, 0, 2 * 3.14159)  # Outer eye
    ctx.set_line_width(0.5)
    ctx.stroke()
    ctx.set_source_rgb(0, 0, 0)  # Black pupil
    ctx.arc(32, -21, 3, 0, 2 * 3.14159)  # Pupil
    ctx.fill()

    ctx.set_source_rgb(1, 1, 1)  # White eye
    ctx.arc(50, -20, 7, 0, 2 * 3.14159)  # Outer eye
    ctx.fill()
    ctx.set_source_rgb(0, 0, 0)  # White eye
    ctx.arc(50, -20, 7, 0, 2 * 3.14159)  # Outer eye
    ctx.set_line_width(0.5)
    ctx.stroke()
    ctx.set_source_rgb(0, 0, 0)  # Black pupil
    ctx.arc(52, -21, 3, 0, 2 * 3.14159)  # Pupil
    ctx.fill()

    # Draw the tail
    ctx.set_source_rgb(1, 0.6, 0.1)  # Same as wing color
    ctx.move_to(-50, 0)
    ctx.line_to(-70, -20)
    ctx.line_to(-70, -10)
    ctx.move_to(-50, 0)
    ctx.line_to(-70, -5)
    ctx.line_to(-70, 5)
    ctx.move_to(-50, 0)
    ctx.line_to(-70, 10)
    ctx.line_to(-70, 20)
    ctx.close_path()
    ctx.fill()

# Generate frames with different wing positions
def create_frames():
    wing_positions = [-0.5, -0.8,-1,-1.2,-1.5,-1.7,-2,-1.7,-1.5,-1.2,-1,-0.8,-0.5]  # Wing angles for animation
    for i, angle in enumerate(wing_positions):
        surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, WIDTH, HEIGHT)
        ctx = cairo.Context(surface)
        ctx.set_source_rgba(0, 0, 0, 0)  # Transparent background
        ctx.paint()

        draw_bird(ctx, angle)  # Draw bird with current wing angle

        # Save the frame as a PNG
        surface.write_to_png(f"assets/sprites/frame_{i}.png")

# Run the frame creation
create_frames()




