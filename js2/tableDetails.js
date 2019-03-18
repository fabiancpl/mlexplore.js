var tableDetails = ( function() {

  var data, features,
    callback;

  function init() {

    d3.select( '#table-details' ).html( '' );

    var table = d3.select( '#table-details' ).append( 'table' );

    var columns = features.map( c => { return { field: c.name, title: c.name, sortable: true }; } );
    console.log( columns );
    var structure = {
      data: data,
      columns: columns,
      pagination: true,
      pageSize: 5,
      search: true,
      onClickRow: callback
    };

    $( '#table-details table' ).bootstrapTable( structure );

  }

  return {
    init: init,
    update: init,
    set data( d ) {
      data = d;
    },
    set features( f ) {
      features = f.filter( f => ![ '__seqId', '__x', '__y', '__cluster' ].includes( f.name ) );
    },
    set callback( c ) {
      callback = c;
    }
  }
} )();