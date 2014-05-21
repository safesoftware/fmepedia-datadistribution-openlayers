var lon = -123.000066;
var lat = 49.264549;

function OpenLayersManager() {

	this._onDrawMouseMove;
	this._onDrawMouseDown;
	this._onDrawInitMouseMove;
	this._onDrawMouseDoubleClick;
	this.myPoints = [];
	this.polygonLayer, this.mouseControl, this.drawControl = null;

	this.map = new OpenLayers.Map( "mapOpenLayers" );
	var mapnik = new OpenLayers.Layer.OSM();
	
	this.fromProjection = new OpenLayers.Projection( "EPSG:4326" );   // Transform from WGS 1984
	this.toProjection = new OpenLayers.Projection( "EPSG:900913" ); // to Spherical Mercator Projection
	
	var position = new OpenLayers.LonLat( lon, lat ).transform( this.fromProjection, this.toProjection );
	var zoom = 12;

	this.map.addLayer(mapnik);
	this.map.setCenter(position, zoom);
}


/**
 * Fired when the user clicks the draw polygon button
 */
OpenLayersManager.prototype.drawPolygon = function() {
	this.clearPolygon();

	this.polygonLayer = new OpenLayers.Layer.Vector( "Polygon Layer" );
	this.mouseControl = new OpenLayers.Control.MousePosition();

	//Called when the user finishes drawing a polygon
	this.polygonLayer.events.register('featureadded', this, this.loadStartListener);

	this.map.addLayer( this.polygonLayer );
	this.map.addControl( this.mouseControl );

	this.drawControl = new OpenLayers.Control.DrawFeature( this.polygonLayer,
		OpenLayers.Handler.Polygon );
	this.map.addControl( this.drawControl );
	this.drawControl.activate();
};


/**
 * Called when the user clicks the Clear button
 */
OpenLayersManager.prototype.clearPolygon = function() {
	if(this.drawControl) {
		this.map.removeLayer(this.polygonLayer);
		this.polygonLayer = null;
		this.mouseControl.deactivate();
		this.mouseControl = null;
		this.drawControl.deactivate();
		this.drawControl = null;
		document.getElementById('geom').value = "";
		dataDist.updateQuery();
	}
};


/**
 * 
 */
OpenLayersManager.prototype.loadStartListener = function(inGeom) {
		
	this.createPolygonWKTString(inGeom.feature.geometry.getVertices());
	
}


/**
 * Builds up the WKT string which will be passed into the post request and used by FME Server to generate the
 * bounding box.
 */
OpenLayersManager.prototype.createPolygonWKTString = function(coords) {
	
	var header = "Polygon((";
	var footer = "))";
	
	var textString = header;

	for(var i=0; i < coords.length; i++){
		var point = coords[i].transform( this.toProjection, this.fromProjection );
        var lat = coords[i].y;
        var lng = coords[i].x;
        textString += lng + ' ';
        textString += lat + ',';
    }

    textString = textString.substring(0,textString.length - 1);
	textString += footer;
	
	//Write text to GEOM object.
	document.getElementById('geom').value = textString;
	dataDist.updateQuery();

}