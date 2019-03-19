var exportResults = ( function() {

  var name, data, config;

  function exportData() {

    console.log( 'Exporting data as CSV!' );

    var string = '';

    // Read the user option
    var option1 = d3.select( '#exportDataOption1' ).property( 'checked' );
    var option2 = d3.select( '#exportDataOption2' ).property( 'checked' );
    var option3 = d3.select( '#exportDataOption3' ).property( 'checked' );

    var features = [ '__seqId' ];
    if( option1 ) {
      features.push( '__x' );
      features.push( '__y' );
      if( colorFeature !== undefined ) features.push( colorFeature );
    } else if( option2 ) {
      config.features.forEach( feature => features.push( feature.name ) );
    } else if( option3 ) {
      features = getProjectionFeatures();
      features.push( 'x' );
      features.push( 'y' );
      if( colorFeature !== undefined ) features.push( colorFeature );
    }

    // Add the header of the CSV
    string = features.toString();
    console.log( 'Attributes to export: ' + string );
    string += '\n';

    // Add the content of the CSV
    visibleData.forEach( row => {

      var row_array = [];
      features.forEach( feature => {
        row_array.push( row[ feature ] );
      } );
      string += row_array.toString() + '\n';

    } );

    downloadPlain( string, datasetName + '.csv', 'text/plain' );

    // Hide the export data modal
    $( '#export-results-modal' ).modal( 'hide' );

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