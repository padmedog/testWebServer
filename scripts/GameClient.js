var GameClient = {
	Connected: false,
	Socket: null,
	Connect: null,
	SendPosition: null
};

var Players = [];

var GamePlayer = (function () {
    function GamePlayer(id) {
        this.id = id;
        var material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            shininess: 5,
            shading: THREE.FlatShading
        });
        this.pObj = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 12, 256, 1), material);
		this.pObj.position.y = 6
		//this.pObj.name = "player_" + this.id;
    }
    return GamePlayer;
}());


GameClient.Connect = function(address)
{
	try
	{
		GameClient.Socket = new WebSocket("ws://" + address);
	}
	catch(e)
	{
		return false;
	}
	GameClient.Socket.onopen = function(e) {
		GameClient.Connected = true;
		var elem = document.getElementById("result");
		elem.innerHTML = "success";
	};
	GameClient.Socket.onclose = function(e) {
		GameClient.Connected = false;
	};
	GameClient.Socket.onmessage = function(e) {
		var data = e.data.split(' ');
		switch(data[0])
		{
			case "pos":
			{
				var ind = GetPlayerIndById(parseInt(data[1]));
				if(ind < 0)
				{
					break;
				}
				Players[ind].pObj.position.x = parseInt(data[2]);
				Players[ind].pObj.position.z = parseInt(data[3]);
				break;
			}
			case "add":
			{
				var pl = new GamePlayer(parseInt(data[1]));
				pl.pObj.position.x = parseInt(data[2]);
				pl.pObj.position.z = parseInt(data[3]);
				Players.push(pl);
				//objectsToMove.push(pl.pObj);
				holder.add(pl.pObj);
				console.log("client " + pl.id + " connnected (ind " + GetPlayerIndById(pl.id) + ")");
				break;
			}
			case "del":
			{
				var ind = GetPlayerIndById(parseInt(data[1]));
				if(ind < 0)
				{
					break;
				}
				console.log("client " + Players[ind].id + " destroyed (ind " + ind + ", " + holder.children.indexOf(Players[ind].pObj) + ")");
				holder.remove(Players[ind].pObj);
				
				/*var i = objectsToMove.indexOf(Players[ind].pObj);
				if(i >= 0)
				{
					objectsToMove.splice(i, 1);
				}
				Players.splice(ind, 1);*/
				break;
			}
		}
	};
	return true;
};


function GetPlayerIndById(id)
{
	for(var i = 0; i < Players.length; i++)
	{
		if(Players[i].id == id)
		{
			return i;
		}
	}
	return -1;
}
function GetPlayerById(id)
{
	for(var i = 0; i < Players.length; i += 1)
	{
		if(Players[i].id == id)
		{
			return Players[i];
		}
	}
	return null;
}
GameClient.SendPosition = function(position)
{
	GameClient.Socket.send("pos " + String(position.x) + " " + String(position.z));
	console.log("sent position");
};