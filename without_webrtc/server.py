from flask import Flask, render_template, Response, request, jsonify
import cv2

app = Flask(__name__)

video_capture = cv2.VideoCapture(0)

def gen_frames():
    while True:
        success, frame = video_capture.read()
        if not success:
            break
        else:
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/update_joystick', methods=['POST'])
def update_joystick():
    data = request.json
    print('Joystick Data Received:', data)
    return jsonify(success=True)

@app.route('/move_left', methods=['POST'])
def move_left():
    print('turned left');
    return "", 204

@app.route('/move_right', methods=['POST'])
def move_right():
    print('turned right');
    return "", 204

@app.route('/stop_rob', methods=['POST'])
def stop_rob():
    print('stopped');
    return "", 204

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
