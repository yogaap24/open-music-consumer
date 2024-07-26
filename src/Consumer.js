require("dotenv").config();
const amqp = require("amqplib");
const fs = require("fs");
const PlaylistsService = require("./PlaylistsService");
const MailSender = require("./MailSender");
const Listener = require("./Listener");

const initConsumer = async () => {
  const playlistsService = new PlaylistsService();
  const mailSender = new MailSender();
  const listener = new Listener(playlistsService, mailSender);

  const options = {
    cert: fs.readFileSync(__dirname + "/../certs/new-cert.pem"),
    key: fs.readFileSync(__dirname +"/../certs/new-key.pem"),
    ca: [fs.readFileSync(__dirname +"/../certs/ca-cert.pem")],
    rejectUnauthorized: true,
  };

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER, options).then((conn) => {
    fs.appendFileSync(__dirname + '/../src/logs/info.log', `${new Date().toLocaleString()} [RabbitMQ] Connection success\n`);
    return conn
  }).catch((err) => {
    fs.appendFileSync(__dirname + '/../src/logs/error.log', `${new Date().toLocaleString()} [RabbitMQ] Connection failed\n`);
    return err
  });
  
  const channel = await connection.createChannel();

  await channel.assertQueue("export:playlists", {
    durable: true,
  });

  channel.consume("export:playlists", listener.listen, { noAck: true });
};

initConsumer();
