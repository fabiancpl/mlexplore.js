var exportResults = ( function() {

  var name, data, config;

  function exportData() {

    console.log( 'Exporting data as CSV!' );

    var string = '';

    // Read the user option
    var option1 = d3.select( '#exportDataOption1' ).property( 'checked' );
    var option2 = d3.select( '#exportDataOption2' ).property( 'checked' );
    var option3 = d3.select( '#exportDataOption3' ).property( 'checked' );

    var features = [];
    if( option1 ) {
      features.push( '__seqId' );
      features.push( '__x' );
      features.push( '__y' );
      if( config.models.clustering !== undefined ) features.push( '__cluster' );
    } else if( option2 ) {
      features = config.features.map( f => f.name );
    } else if( option3 ) {
      features = config.features.filter( f => config.roles.embed.includes( f.name ) ).map( f => f.name );
      features = [ '__seqId' ].concat( features );
      features.push( '__x' );
      features.push( '__y' );
      if( config.models.clustering !== undefined ) features.push( '__cluster' );
    }

    // Add the header of the CSV
    string = features.toString();
    console.log( 'Attributes to export: ' + string );
    string += '\n';

    // Add the content of the CSV
    string += data.map( row => {
      return features.map( feature => {
        return row[ feature ];
      } ).join( ',' );
    } ).join( '\n' );

    downloadPlain( string, name + '.csv', 'text/plain' );

    // Hide the export data modal
    $( '#export-data-modal' ).modal( 'hide' );

  }

  function exportEmbedding() {

    console.log( 'Exporting embedding as PNG!' );

    var embedding = d3.select( '#embedding' ).select( 'svg' ).node();
    saveSvgAsPng( embedding, name + '-embedding.png' );

  }

  function exportConfiguration() {

    console.log( 'Exporting configuration as JSON!' );

    var configCopy = Object.assign( {}, config );
    downloadPlain( JSON.stringify( configCopy, null, 2 ), name + '-config.json', 'text/plain' );

  }

  function downloadPlain( content, fileName, contentType ) {
    var a = document.createElement( 'a' );
    var file = new Blob( [ content ], { type: contentType } );
    a.href = URL.createObjectURL( file );
    a.download = fileName;
    a.click();
  }  

  return {
    exportData: exportData,
    exportEmbedding: exportEmbedding,
    exportConfiguration: exportConfiguration,
    set name( n ) {
      name = n;
    },
    set data( d ) {
      data = d;
    },
    set config( c ) {
      config = c;
    }
  }
} )();