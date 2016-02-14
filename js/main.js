/* Scripts by Tobin McGilligan, 2015 */

var map = L.map('map', {
	center: [43.075865, -89.400984],
	zoom: 16
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'tobinmcg.p4biih0o',
    accessToken: 'pk.eyJ1IjoidG9iaW5tY2ciLCJhIjoiZWViZjgzODg4NGJiODc3YTQ4YjVhNmQ1NTQ2OTE3ODYifQ.IQc9cPbv4yG-kTMVmkiU7g'
}).addTo(map);