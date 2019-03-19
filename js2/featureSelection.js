var featureSelection = ( function() {

  var features;

  function init() {

    drawGroups( 'embed-group', features.filter( f => f.role === 'embed' ) );
    drawGroups( 'color-group', features.filter( f => f.role === 'color' ) );
    drawGroups( 'none-group', features.filter( f => f.role === 'none' ) );

  }

  function drawGroups( group, features ) {

    var featButtons = d3.select( '#feature-selection #' + group )
      .selectAll( 'button' )
      .data( features )
      .enter()
        .append( 'button' )
          .attr( 'id', f => f.name )
          .attr( 'class', f => 'btn btn-secondary' )
          .attr( 'draggable', true )
          .attr( 'ondragstart', 'featureDrag(event)' );

    // Add feature name to element
    featButtons
      .append( 'span' )
      .text( f => f.name );

    // Add feature type icon to element
    featButtons
      .append( 'i' )
      .attr( 'id', d => d.name + '-type' )
      .attr( 'class', 'text-warning' )
      .html( d => ( ( d.type === 'categorical' ) ? '<b>A</b>' : ( d.type === 'binary' ) ? '<b>B</b>' : '<b>#</b>' ) );

  }

  function allowDrop( event ) {
    event.preventDefault();
  }

  function drag( event ) {
    event.dataTransfer.setData( 'text', event.target.id );
  }

  function drop( event ) {

    return new Promise( ( resolve, reject ) => { 
      
      event.preventDefault();
      var elementId = event.dataTransfer.getData( 'text' );
      if( event.target.tagName === 'DIV' ) {

        if( !( event.target.id === 'color-group' && features.find( f => f.role === 'color' ) !== undefined ) ) {

          if( event.target.id === 'embed-group' && features.find( f => f.name === elementId ).type === 'categorical' ) {
            reject( 'A categorical attribute cannot be used for embedding!' );  
          } else {

            event.target.appendChild( document.getElementById( elementId ) );
            features.find( f => f.name === elementId ).role = event.target.id.replace( '-group', '' );
            resolve( features );
            
          }

        } else {
          reject( 'You need to remove first the current attribute used for color!' );
        }
      }
    } );

  }

  // Clean panel
  function clean() {

    //d3.select( '#feature-selection #embed-group' ).html( '' );
    //d3.select( '#feature-selection #color-group' ).html( '' );
    //d3.select( '#feature-selection #none-group' ).html( '' );

  }

  return {
    init: init,
    allowDrop: allowDrop,
    drop: drop,
    drag: drag,
    clean: clean,
    get features() {
      return features;
    },
    set features( f ) {
      features = f.filter( f => ![ '__seqId', '__x', '__y', '__cluster' ].includes( f.name ) );
    }
  }
} )();