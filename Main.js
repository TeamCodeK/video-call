// PeerJS
let peer = new Peer({
    host: "https://peerjs2106.herokuapp.com",
    secure: true,
    port: 443
});
let peerID = peer.on("open", peerID => peerID); // Bug here
console.log(peerID); // peerID is NULL


// SocketIO
let socket = io("https://video-call-server.herokuapp.com/");


// User
let localUser = {
    name: null,
    id: null 
}
let isLogin = false; 


// Document QuerySelector
let mainBox;
let registerBox;
let userOnlineBox;
let userOnline;

function getStream() {
    return navigator.mediaDevices.getUserMedia({audio: true, video: true});
}

function playStream(selector) {
    getStream()
    .then(stream => {
        document.querySelector(selector).srcObject = stream; 
    });
}

function call(id_user) {
    getStream()
    .then(stream => {
        playStream("#localStream", stream);
        let call = peer.call(id_user, stream);
        console.log(typeof call);
        call.on("stream", rStream => {
            playStream("#remoteStream", rStream);
        });
    });
}

function createUserEl(user) {
    return `
        <li class="user" peerid="${user.peerID.id}">
            <h4>${user.name}</h4>
        </li>
    `;
}

function randomID(le) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i <= le; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

window.onload = () => {
    socket.on("connect", (_) => {
        console.log("Socket.IO is running");
        mainBox          = document.querySelector(".mainBox");
        registerBox      = document.querySelector(".registerBox");
        userOnlineBox    = document.querySelector(".online");
        document.querySelector(".rt").addEventListener("click", () => {
            mainBox.style.display     = "block";
            registerBox.style.display = "none";
            localUser.name = document.querySelector(".user_name").value;
            localUser.id   = peerID.id;
            socket.emit("Register", {name: localUser.name, peerID: peerID});
        }); 
        window.addEventListener("keydown", (e) => {
            if (isLogin == false) {
                if (e.which == 13 || e.keyCode == 13) {
                    e.preventDefault();
                    document.querySelector(".rt").click();
                }
            }
        });
        socket.on("Online", user_arr => {
            isLogin == true;
            userOnlineBox.innerHTML = "";
            user_arr.map(user => {
                userOnlineBox.innerHTML += createUserEl(user);
                userOnline = document.querySelector(".user");
                userOnline.addEventListener("click", function () {
                    call(this.getAttribute("peerid"));
                });
            });
        });
        peer.on("call", call => {
            getStream()
            .then(stream => {
                playStream("#localStream", stream);
                call.answer(stream);
                call.on("stream", rStream => {
                    playStream("#remoteStream", rStream);
                });
            });
        });
    });
}

