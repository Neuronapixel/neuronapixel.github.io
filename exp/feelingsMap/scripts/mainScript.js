//https://dev.twitter.com/start
//https://dev.twitter.com/docs/streaming-apis/connecting
// https://dev.twitter.com/docs/api/1.1
var miData;
$(document).ready(function(){
	//alert("Pagina cargada");
	//"http://ip.jsontest.com/"
	/* via AJAX
	$.ajax({url:"http://date.jsontest.com",
			dataType:"json"
			success:function(data){
				//alert(data.ip);
				miData=data;
			}});
	*/
	/*
	$.ajax({url:"http://date.jsontest.com",
			dataType:"json"
		})
	.done(function(data){
		alert(data);
		miData=data;
	})
	*/
	/* usin getJSON
	$.getJSON("http://date.jsontest.com",function(){

		console.log("success");

	}).
	done(function(){
		console.log("success 2");
	}).
	fail(function(){

		console.log("fail");
	})
	.always(function(){
		console.log("allways");

	});
*/

/*
  var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
  $.getJSON( flickerAPI, {
    tags: "mount rainier",
    tagmode: "any",
    format: "json"
  })
    .done(function( data ) {
      $.each( data.items, function( i, item ) {
        $( "<img>" ).attr( "src", item.media.m ).appendTo( "#images");
        if ( i === 3 ) {
          return false;
        }
      });
    });
*/	
consKey="0nngEWUklLJCxx6nFtg4vFtQE";
consSecret="o2MN7zHHrPX1vSclUXFAANNqIV60BP3f48TxhwvPPq5JQXvKG1";
accesConsumer=consKey+":"+consSecret;
codedConsAcces= btoa(accesConsumer);
var all='Basic '+codedConsAcces;

$.ajax({
    url: "https://api.twitter.com/oauth2/token",
    type: "POST",
    data:{'grant_type':'client_credentials'},
    success: function(data) {
     alert('hello!');
     miData=data;
     console.log(data);
 	},
    error: function(html) { 
    	alert(html); 
    },
    beforeSend: setHeader
});

function setHeader(xhr){
	console.log(all);
	xhr.setRequestHeader('Authorization',all);
}
})