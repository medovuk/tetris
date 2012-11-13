var allPlayersData = null;

function initBoard(players, allPlayersScreen){
    var canvases = new Object();
    var infoPools = new Object();

    function constructUrl() {
        if (allPlayersScreen) {
            return "/screen?allPlayersScreen=true"
        }
        var url = "/screen?";
        for (var player in players) {
            if (players.hasOwnProperty(player)) {
                url += player + "=" + player + "&";
            }
        }
        return url;
    }

    function drawGlassForPlayer(playerName, plots) {
        canvases[playerName].clear();
        $.each(plots, function (index, plot) {
            for (var color in plot) {
                x = plot[color][0];
                y = plot[color][1];
                canvases[playerName].drawPlot(color, x, y);
    //            $('#showdata').append("<p>" + color + " x:" + x + " y:" + y + "</p>");
            }
        })
    }

    function calculateTextSize(text) {
        var div = $("#width_calculator_container");
        div.html(text);
        div.css('display', 'block');
        return div[0];
    }

    function showScoreInformation(playerName, information) {
        var infoPool = infoPools[playerName];

        if (information != '') {
            var arr = information.split(', ');
            for (var i in arr) {
                infoPool.push(arr[i]);
            }
        }
        if (infoPool.length == 0) return;

        var score = $("#score_info_" + playerName);
        var canvas = $("#" + playerName);

        if (score.is(':visible')) {
            return;
        }

        var text = '<center>' + infoPool.join('<br><br>') + '</center>';
        infoPool.splice(0, infoPool.length);

        var size = calculateTextSize(text);
        score.css({
                position: "absolute",
                marginLeft: 0,
                marginTop: 0,
                left: canvas.position().left + canvas.width()/2 - size.clientWidth/2,
                top: canvas.position().top + canvas.height()/2 - size.clientHeight/2
            });

        score.html(text);

        score.show().delay(300).fadeOut(1600, function() {
            score.hide();

            showScoreInformation(playerName, '');
        });

    }

    function Canvas(canvasName) {
        const plotSize = 24;
        const glassHeight = 20;
        this.playerName = canvasName;

        Canvas.prototype.drawPlot = function (color, x, y) {
            $("#" + this.playerName).drawImage({
                source:$("#" + color)[0],
                x:x * plotSize + plotSize / 2,
                y:(glassHeight - y) * plotSize - plotSize / 2
            });
        };

        Canvas.prototype.clear = function () {
            $("#" + this.playerName).clearCanvas();
        }
    }

    function isPlayersListChanged(data) {
        var newPlayers = Object.keys(data);
        var oldPlayers = Object.keys(players);

        if (newPlayers.length != oldPlayers.length) {
            return true;
        }

        var hasNew = false;
        newPlayers.forEach(function (newPlayer) {
            if ($.inArray(newPlayer, oldPlayers) == -1) {
                hasNew = true;
            }
        });

        return hasNew;
    }

    $(document).ready(function () {
        for (var i in players) {
            var player = players[i];
            canvases[player] = new Canvas(player);
            infoPools[player] = [];
        }

        (function updatePlayersInfo() {
            $.ajax({ url:constructUrl(), success:function (data) {
                if (data == null) {
                    $("#showdata").text("There is NO data for player available!");
                    return;
                }
                $("#showdata").text('');

                if (allPlayersScreen && isPlayersListChanged(data)) {
                    window.location.reload();
                    return;
                }
                if (allPlayersScreen) { // uses for leaderstable.jsp
                    allPlayersData = data;
                }
                $.each(data, function (playerName, value) {
                    $.each(value, function (key, data) {
                        if (key == "plots") {
                            drawGlassForPlayer(playerName, data);
                        } else if (key == "score") {
                            $("#score_" + playerName).text(data);
                        } else if (key == "info") {
                            showScoreInformation(playerName, data);
                        }
                        if (!allPlayersScreen) {
                            if (key == "linesRemoved") {
                                $("#lines_removed_" + playerName).text(data);
                            } else if (key == "nextLevelIngoingCriteria") {
                                $("#next_level_" + playerName).text(data);
                            } else if (key == "level") {
                                $("#level_" + playerName).text(data);
                            }
                        }
                    });
                });
            },
                data:players,
                dataType:"json", cache:false, complete:updatePlayersInfo, timeout:30000 });
        })();
    });
};