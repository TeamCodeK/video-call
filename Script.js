let isLogin = false;
let peer = new Peer({host: 'https://dashboard.heroku.com/apps/codekk/settings'});
let socket = io("https://video-call-server.herokuapp.com/");

let localUser = {
    name: null,
    id: null
};

let peerID = peer.on("open", peer_id => peer_id.id);

let createUser = (user) => {
    return `
        <li class="user" peerid="${user.peerID.id}"><h4>${user.name}</h4></li>
    `;
}

// Nhìn tên hàm là bs
getStream = () => {
    return navigator.mediaDevices.getUserMedia({audio: true, video: true});
}


// Chạy video nhé
playStream = (selector, stream) => {
    let video = document.querySelector(selector);
    video.srcObject = stream;
}


// Gọi người cần gọi 
call = (id_user) => {
    getStream()
    .then(stream => {
        if (stream == null) {
            return alert("Không thể nhận được media từ người dùng");
        }
        console.log(typeof stream);
        playStream("#localStream", stream);
        let call = peer.call(id_user, stream)
        call.on('stream', (remoteStream) => {
            playStream("#remoteStream", remoteStream); 
        });
    });
}

// Thực hiện hàm này khi DOM được tải đầy đủ
window.onload = () => {
    document.querySelector(".mainBox").style.display = "none";

    document.querySelector(".rt").addEventListener("click", () => {
        socket.emit("Register", {name: document.querySelector(".user_name").value, peerID: peerID});
        document.querySelector(".mainBox").style.display = "block";
        document.querySelector(".registerBox").style.display = "none";
        localUser.name = document.querySelector(".user_name").value;
        localUser.id   = peerID.id;
    });
    
    window.addEventListener("keydown", (e) => {

        if (isLogin == true) {
            return 0;
        }
        console.log(e);
        if (e.which == 13 || e.keyCode == 13) {
            console.log("Enter");
            e.preventDefault();
            document.querySelector(".rt").click();
        }
    });
}


// Lắng nghe sự kiện server trả về những người dùng đang online
socket.on("Online", user_arr => {
    console.table(user_arr);
    isLogin = true;
    document.querySelector(".online").innerHTML = "";
    user_arr.map(user => {
        document.querySelector(".online").innerHTML += createUser(user);

    });

    let userList = document.querySelectorAll(".user");
        userList = [...userList];
        userList.map(user => {
        user.addEventListener("click", function() {
            call(this.getAttribute("peerid"));    
        });
    });
});


// Trả lời cuộc gọi khi có cuộc gọi đến
peer.on('call', call => {
    getStream()
    .then(stream => {
        if (stream == null) {
            return alert("Không thể nhận được media từ người dùng");
        }
        playStream("#localStream", stream);
        call.answer(stream);
        call.on("stream", remoteStream => {
            playStream("#remoteStream", remoteStream);
        });
    });
});



