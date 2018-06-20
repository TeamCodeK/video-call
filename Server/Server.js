let io = require("socket.io")(process.env.PORT || 3000);
let user_arr = [];

// Kiểm tra user nào đó có đang tồn tại không, trả về 1 nếu có, 0 nếu không có
let existUser = (_user) => {
    let exist = user_arr.map(user => {
                    if (user.peerID.id == _user.peerID.id) { 
                        return 1;
                    }
                });
    if (exist.indexOf(1) >= 0) {
        return 1;
    }
    else return 0;
}


io.on("connection", socket => {
    socket.on("Register", user => {
        user_arr.push(user);
        socket.localUser = user;
        socket.emit("Online", user_arr);
        socket.broadcast.emit("Online", user_arr);
    });

    socket.on("disconnect", () => {

        if (socket.localUser == null) {
            return 0;
        }

        let splice = user_arr.splice(user_arr.indexOf(socket.localUser), existUser(socket.localUser));
        socket.broadcast.emit("Online", user_arr);
    });
});
