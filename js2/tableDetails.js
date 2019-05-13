var tableDetails = ( function() {

  var data, features,
    onRowSelection;

  function init() {

    d3.select( '#table-details' ).html( '' );

    var table = d3.select( '#table-details' ).append( 'table' );

    var columns = features.map( c => { return { field: c.name, title: c.name, sortable: true }; } );
    //console.log( columns );
    var structure = {
      data: data,
      columns: columns,
      pagination: true,
      pageSize: 5,
      search: true,
      onClickRow: onRowSelection
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
      features = f.filter( f => ![ '__seqId', '__x', '__y', '__cluster', '__highlighted' ].includes( f.name ) );
    },
    set onRowSelection( f ) {
      onRowSelection = f;
    }
  }
} )();