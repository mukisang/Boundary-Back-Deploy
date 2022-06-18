import path from 'path'
const setting = {
    'secret': 'SeCrEtKeYfOrHaShInG',
    'mongodbUri': 'mongodb://127.0.0.1:27017/devBoundary',
    'serverPort' : 5000,
    // 'staticPath' : "https://boundary.or.kr/api/",
    'staticPath' :  path.resolve() + "/static/profiles/",
    "filePath" : path.resolve() + "/static/profiles/"
}

export {setting};
