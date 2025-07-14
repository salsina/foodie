// relay.js  – newline-delimited JSON broadcast for FoodieMap
import net from "net";

// Railway injects PORT. Fall back to 443 for local tests.
const PORT = process.env.PORT || 443;

let peers     = new Set();
let snapshot  = { restaurants: [], globalChat: [] };

function broadcast(line) {
  for (const p of peers) p.write(line + "\n");
}

net.createServer(socket => {
  socket.setEncoding("utf8");
  peers.add(socket);

  // 1) Send snapshot to newcomer
  socket.write(JSON.stringify({ type: "snapshot", ...snapshot }) + "\n");

  socket.on("data", chunk => {
    for (const line of chunk.split("\n").filter(Boolean)) {
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }

      // --- Book-keeping so newbies get history ---
      if (msg.type === "restaurant_add")  snapshot.restaurants.push(msg.data);
      if (msg.type === "chat_global")      snapshot.globalChat.push(msg.data);
      if (msg.type === "restaurant_like") {
        const r = snapshot.restaurants.find(r => r.key === msg.key);
        if (r && !r.upvotes?.includes(msg.user)) (r.upvotes ??= []).push(msg.user);
      }
      if (msg.type === "chat_place") snapshot.globalChat.push(msg.data); // or keep separate

      // 2) Broadcast line to everyone
      broadcast(line);
    }
  });

  socket.on("close",   () => peers.delete(socket));
  socket.on("error", _ => peers.delete(socket));
}).listen(PORT, () => console.log("Relay running on", PORT));
