module.exports =  [{
    "name": "Main URL",
    "insert": false,
    "description": "This extracts the main domain and access protocol of a HTTP URL. The first capture is the protocol, second is the domain, and the third is the rest.",
    "script": "(http(s)*\:\/\/)([^\/|:]*)([^\s]*)",
    "system": true
}]
