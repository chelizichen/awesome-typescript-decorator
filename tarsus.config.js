module.exports = {
    database:[
        {
            default:true,
            type: "mysql",
            host: "localhost",
            username: "root",
            password: "123456",
            database: "zrq_shop", //所用数据库
            port: 3306,
            connectionLimit: 10,
        }
    ],
    servant: {
        // project: "TarsusHttpProject -l node -t @tarsus/http -h 127.0.0.1 -p 9811",
        project:"TarsusProxyServant -l node -t @tarsus/ms -h 127.0.0.1 -p 10012",
        src:"test/microservice/register",
        // includes: [
        //     "TarsusTestNodeService -l node -t @tarsus/ms -h 127.0.0.1 -p 10012",
        //     "TarsusTestJavaService -l java -t @tarsus/ms -h 127.0.0.1 -p 7099",
        // ]
    }
}