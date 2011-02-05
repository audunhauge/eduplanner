// funksjoner for å vise fagplaner
// alle typer planer untatt timeplaner

function synopsis(coursename,plandata,tests) {
  // returns a synopsis of each week
  // this is a tiny timeplan for each week (drawn as tiny divs)
  // with all tests and events plotted in
  var prover = alleprover;
  var felms = coursename.split('_');
  var fag = felms[0];
  var gru = felms[1];
  var elever = memberlist[gru];
  var andre = getOtherCG(elever);
  //var events = database.aarsplan;
  var myttimer = timetables.course[coursename];
  var jd = database.firstweek;
  var mytt = {};
  for (var i=0; i< myttimer.length;i++) {
     var pt = myttimer[i];
     if (!mytt[pt[1]]) {    // ingen rad definert ennå
         mytt[pt[1]] = {};  // ny rad
     }
     mytt[pt[1]][pt[0]] = 1;
  }
  var synop = {};
  var s = '';
  for (var i=0; i<10; i++) {
     for (var j=0; j<5; j++) {
        if (mytt[i] && mytt[i][j]) {
          s += '<div class="tinytt" style="top:'+(i*3)+'px; left:'+(j*6)+'px;"></div>';
        }
     }
  }
  var standard = s;
  for (section in  plandata) {
    var ulist = memberlist[gru];
    var s = '';
    var links = [];    // builds popup-buttons for test showing affected studs
    var heldag = [];    // full-day-tests for some or all studs in this group
    for (var j=0; j<5; j++) {
        pro = prover[jd+j];
        var title = [];
        var testitle = [];
        if (database.freedays[jd+j]) {
          title.push(database.freedays[jd+j]);
          s += '<div title="'+title.join('')+'" class="totip tinyfree" style="left:'+(j*6)+'px;"></div>';
        }
        var hd = database.heldag[jd+j];
        for (fag in hd) {
          if (coursename.indexOf(fag) >= 0) {
            title.push(fag+' '+hd[fag]);
            s += '<div title="'+title.join('<br>')+'" class="totip tinyhd" style="left:'+(j*6)+'px;"></div>';
            if (!heldag[j]) heldag[j] = [];
            heldag[j].push(fag+' '+hd[fag]);
          } else if ($j.inArray(fag.toUpperCase(),andre.fag) != -1) {
            title.push(fag+' '+hd[fag]);
            if (!heldag[j]) heldag[j] = [];
            heldag[j].push(fag+' '+hd[fag]);
            s += '<div title="'+title.join('<br>')+'" class="totip tinyohd" style="left:'+(j*6)+'px;"></div>';
          }
        } 
        if (pro) {
          // var hdager = pro.hd[j].split('zz');
          // sjekk mot vanlige prøver i andre grupper
          for (k=0; k < pro.length; k++) {
              var progro = pro[k].shortname.split('_')[1];
              if (progro && $j.inArray(progro,andre.gru) != -1) {
                  var grlink = pro[k].shortname.split('_')[0];
                  var grheading = '<span class="uheader">' + pro[k].shortname + '</span>';
                  var popup = makepop(grlink,ulist,progro,gru,'group',grheading);
                  testitle.push(pro[k].shortname+' '+pro[k].username);
                  var tlist = pro[k].value.split(',');
                  var min = +tlist.shift();
                  var max = +tlist.pop() || min;
                  if (!links[j]) links[j] = [];
                  links[j].push('<ul class="nav">' + popup + '</ul>');
                  s += '<div title="'+testitle.join('<br>')+'" class="totip tinytest" style="left:'
                      +(j*6)+ 'px; top:'+ ((min-1)*3) +'px; height:'+(max+1-min)*3+'px; "></div>';
              }
          }
        }
    }
    synop[section] = {};
    synop[section].tiny = '<div class="tinytim">'+standard+s+'</div>';
    synop[section].links = links;
    synop[section].heldag = heldag;
    jd += 7;
  }
  return synop;
}

function vis_fagplaner(data) {
    // viser fagplaner for valgt bruker
     if (data.fag) {
        var fagliste = data.fag;
        var s = '<table class="fagplaner">';
        s += '<caption>Fagplaner</caption>';
        s += '<tr><th>Fag</th><th>Tema</th><th>Vurdering</th><th>Mål</th><th>Oppgaver</th><th>Log/Merk</th></tr>';
        var i;
        for (i=0; i<fagliste.length; i++) {
            var f = fagliste[i];
            var summary = Url.decode(f.summary+'||||');
            summary = summary.replace(/<br><br>/g,"<br>");
            summary = summary.replace(/<br><br>/g,"<br>");
            summary = summary.replace(/<br>$/,"").split('\|');
            s += '<tr class="'+f.harplan+'" ><td>' + f.shortname + '</td><td>'+ summary[0] + '</td><td>' + summary[1] + '</td>';
            s += '<td>' + summary[2] + '</td><td>' + summary[3] + '</td><td>' + summary[4] + '</td></tr>';
        }
        s+= "</table>";
        return s;
     } 
     return '';
}

function show_alleprover(filter,faggrupper) {
    // filter lar deg velge fra [heldag,prøve]
    // faggrupper  { "3inf5":1,"3304":1,"3nor6":1 }
    //   bare vis prøver/heldag for fag/grupper
    filter = typeof(filter) != 'undefined' ? filter : '';
    var thisweek = database.startjd;
    var s = "<table class=\"heldag\">";
    s += "<tr><th>Uke</th><th>Man</th><th>Tir</th><th>Ons</th>";
    s += "<th>Tor</th><th>Fre</th></tr>";
    var i,j;
    var e;
    for (jd = database.firstweek; jd < database.lastweek; jd += 7 ) {
      if (jd < thisweek) continue;
      s += "<tr>";
      s += '<th><div class="weeknum">'+julian.week(jd)+'</div><br class="clear" /><div class="date">' + formatweekdate(jd) + "</div></th>";
      for (j=0;j<5;j++) {
        var proveliste = '';
        var tdclass = '';
        if (database.freedays[jd+j]) {
          proveliste = database.freedays[jd+j];
          tdclass = ' class="fridag"';
        } else {
          var pr =  (!filter || filter.indexOf("prove") >= 0 ) ? alleprover[jd+j] || [] : [];
          var hd =  (!filter || filter.indexOf("heldag") >= 0 ) ? database.heldag[jd+j] || {} : {};
          for (fag in hd) {
              if (!faggrupper || faggrupper[fag]) {
                var cat = category[fag] || 0;
                proveliste += '<span class="heldag klasse' + fag.substr(0,1) + ' cat' + cat  + '">' + fag + ' ' + hd[fag] + '</span>';
              }
          } 
          for (var k=0; k< pr.length; k++) {
              var pro = pr[k];
              var faggruppe = pro.shortname.split('_');
              var fag = faggruppe[0];
              var gruppe = faggruppe[1];
              if (!faggrupper || faggrupper[gruppe] || faggrupper[pro.shortname] ) {
                var members = fag + " " + gruppe;
                if (memberlist && memberlist[gruppe]) {
                    // show members as a list (on hover)
                    var userlist = memberlist[gruppe];
                    var antall = userlist.length;
                    members = makepop(members,userlist,gruppe,'','','<span class="proveinfo">'+ pro.username 
                               + " " +pro.value+" ("+antall+' elever)</span>');
                    members = '<ul class="nav gui alleprover">' + members + '</ul>';
                }
                proveliste += '<span class="pro klasse'+fag[0]+' cat'+category[fag]+'">' + members + '</span>';
              }
          }
        }
        s += '<td'+tdclass+'>' + proveliste + "</td>";
      }
      s += "</tr>";
    }
    s += "</table>";
    $j("#main").html(s);
}    

function show_heldag() {
  show_alleprover("heldag");
}

function show_prover() {
  var uid = database.userinfo.id || 0;
  var minefaggrupper = getUserSubj(uid);
  show_alleprover("",minefaggrupper);
}


function getUserSubj(uid) {
  // finner alle prøver for en bruker
  var minefaggrupper = {};
  if (timetables.teach[uid]) {
    // we have a teach 
    // a teach dosn't have all the tests for a given group
    // a group may be connected to different subjects.
    var minefag = database.teachcourse[uid];
    for (var j in minefag) {
      var fagcourse = minefag[j];
      var faggruppe = fagcourse.split('_');
      var fag = faggruppe[0];
      minefaggrupper[fagcourse] = 1;
      minefaggrupper[fag] = 1;
    }
  } else {
    var usergr = memgr[uid] || null;
    if (usergr) {
      for (var i in usergr) {
        var group = usergr[i];
        var fagliste = database.grcourses[group];
        for (var k in fagliste) {
          var fag = fagliste[k];
          minefaggrupper[fag] = 1;
        }
        minefaggrupper[group] = 1;
      }
    } 
  }
  return minefaggrupper;
}

function show_all(thisweek) {
    // viser hele årsplanen (ikke prøver og heldag)
    var events = database.aarsplan;
    var prover = alleprover;
    var theader ="<table class=\"year\" >"
     + "<tr><th>Uke</th><th>Man</th><th>Tir</th><th>Ons</th>"
     + "<th>Tor</th><th>Fre</th><th>Merknad</th></tr>";
    var tfooter ="</table>";
    var s = theader;
    var week = julian.week(thisweek);
    if (week > 30 && week < 45) {
      s += "<caption>Første halvår</caption>";
    }
    if (week > 44 && week < 52) {
      s += "<caption>Første halvår II</caption>";
    }
    if (week < 13 ) {
      s += "<caption>Andre halvår</caption>";
    }
    var i,j;
    var e;
    var pro;   // dagens prover
    var txt;
    var thclass;
    var cc;

    var events = database.yearplan;
    for (i= thisweek; i < database.lastweek; i += 7) {
      e = events[Math.floor(i/7)] || { pr:[],days:[]};
      // add a page break if we pass new year
      if (julian.week(i) == "45") {
         s += tfooter + '<div class="page-break"></div><p>' + theader;
         s += "<caption>Første halvår II</caption>";
      }
      if (julian.week(i) == "1") {
         s += tfooter + '<div class="page-break"></div><p>' + theader;
         s += "<caption>Andre halvår</caption>";
      }
      if (julian.week(i) == "13") {
         s += tfooter + '<div class="page-break"></div><p>' + theader;
         s += "<caption>Andre halvår II</caption>";
      }
      pro = { pr:(prover[i] || []) , hd:(database.heldag[i] || [] ) };
      s += "<tr>";
      //thclass = e.klass;
      thclass = '';
      //s += "<th class=\""+thclass+"\">"+e.week+"</th>";
      //s += "<th>"+julian.week(i)+'<br><span class="date">' + formatweekdate(i) + "</span></th>";
      s += '<th><div class="weeknum">'+julian.week(i)+'</div><br class="clear" /><div class="date">' + formatweekdate(i) + "</div></th>";
      for (j=0;j<6;j++) {
        var xtra = '';
        var tlist = [];
        var totip = '';  // no tooltip so far
        if (database.freedays[i+j]) {
          txt = database.freedays[i+j];
          tdclass = 'fridag';
        } else {
          tdclass = '';
          if (database.heldag[i+j]) {
            tlist.push('Heldag/Eksamen');
            var hd =  database.heldag[i+j];
            for (fag in hd) {
                tlist.push(fag + ' ' + hd[fag]);
            } 
            tdclass += 'hd';
            totip = " totip";
            xtra += 'heldag';
          }
          if (prover[i+j] ) {
              tdclass += 'pr';
              totip = " totip";
              //tlist.push(countme(prover[i+j]) + ' prøver');
              tlist.push( 'Prøver<br>'+$j.map(prover[i+j],function(e,i) {
                      var val = e.value.replace(/1.+9/,"heldag");
                      return (""+ e.shortname + ' '+ e.username+' '+val);
                    }).join('<br>'));
              //xtra += '<span title="prøve" class="enprove">x</span>'; 
              xtra += ' prøve';
          }
          xtra = (xtra) ? '<div class="gui textcenter hinted">'+xtra+'</div>' : '';
          txt = e.days[j] || xtra;
        }
        var title = tlist.join('<br>'); 
        title = (title) ? 'title="'+title+'"' : '';
        s += '<td ' + title + ' class="'+tdclass+totip+'">' + txt + "</td>";
      }
      s += "</tr>";
    }
    s += "</table>";
    $j("#main").html(s);
    $j(".totip").tooltip();
}



function updateFagplanMenu() {
    // denne funksjonen kjøres ved onready etter at timeplanen for brukeren er lest
    // den oppdaterer menyen MinePlaner med en liste med fag
    // <a id="mineplaner"   href="#">Mine fagplaner</a>
    var uid = database.userinfo.id || 0;
    var minefag = [];
    if (timetables.teach[uid]) {
      // we have a teach 
      isteach = true;
      minefag = database.teachcourse[uid];
    } else {
      var usergr = memgr[uid] || null;
      if (usergr) {
        for (var i in usergr) {
          var group = usergr[i];
          var fagliste = database.grcourses[group];
          for (var k in fagliste) {
            var fag = fagliste[k];
            if (fag == "KOMO") continue;
            minefag.push(fag+"_"+group);
          }
        }
      } 
    }
    var s = '<a id="mineplaner"   href="#">Mine fag</a><ul>';
    if (isteach) {
      s += '<li><a href="#">Planer</a><ul>';
    }
    for (var i in minefag) {
        var fag = minefag[i];
        s += '<li><a id="'+fag+'" href="#">' + fag + '</a></li>';
    }
    if (isteach) {
        s += '</ul></li>';
        s += '<li><a href="#">Prøver</a><ul>';
        for (var i in minefag) {
            var fag = minefag[i];
            s += '<li><a id="prove_'+fag+'" href="#">' + fag + '</a></li>';
        }
        s += '</ul></li>';
    }
    s += '</ul>';
    $j("#teachmenu").html(s);
    //$j("#mineplaner").after('<li><a href="">Prøveplaner</a></li>');
    for (var i in minefag) {
        var fag = minefag[i];
        $j("#prove_"+fag).click(function() {
            var fagnavn = $j(this).html();
            var plandata = courseplans[fagnavn];
            edit_proveplan(fagnavn,plandata);
        } );
        $j("#"+fag).click(function() {
            var fagnavn = $j(this).html();
            var plandata = courseplans[fagnavn];
            visEnPlan(fagnavn,plandata,true);
        } );
    }
}


function vis_andreplaner() {
    var s="<div id=\"timeviser\"><h1>Andre fagplaner</h1><h4>Velg fra menyen Fagplaner-&gt;AndreFag ..</h4>";
    $j("#main").html(s);
}


// visEnPlan har flytta til rediger.js
// da den lar deg redigere dersom du er eier av planene



function show_next4() {
    // vis neste fire uker
    var uid = database.userinfo.id || 0;
    var events = database.yearplan;
    var thisweek = database.startjd;
    var tests = add_tests(uid,thisweek).tests;
    var s = "<table class=\"uke next\">";
    s += "<tr><th>Uke</th><th>Man</th><th>Tir</th><th>Ons</th>";
    s += "<th>Tor</th><th>Fre</th><th>Merknad</th></tr>";
    var i,j,k;
    var e,txt,pro;
    var jdclass;
    for (i=thisweek; i < thisweek+22; i+= 7) {
      e = events[Math.floor(i/7)] || {pr:[],days:[ [],[],[],[],[],[] ] };
      s += "<tr>";
      //s += "<th>"+julian.week(i)+'<br><span class="date">' + formatweekdate(i) + "</span></th>";
      s += '<th><div class="weeknum">'+julian.week(i)+'</div><br class="clear" /><div class="date">' + formatweekdate(i) + "</div></th>";
      for (j=0;j<6;j++) {
          tdclass = '';
          if (database.freedays[i+j]) {
            txt = database.freedays[i+j];
            tdclass = ' class="fridag"';
          } else {
            pro = tests[i+j];
            if (pro) {
              txt = "<span class=\"prove\">" + pro.shortname+ ' ' + pro.value + "</span>";
            } else {
              txt = "";
            }
            txt += e.days[j] || "";
          }
          s += '<td'+tdclass+'>' + txt + "</td>";
      }
      s += "</tr>";
    }
    s += "</table>";
    $j("#main").html(s);
}

