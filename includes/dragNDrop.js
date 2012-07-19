var dragSources = [];

/*
 * Initializes a DOM element to be a drag source
 * 
 *  Method will iterate over all the element's children and inject the needed mouse event
 *   handlers so that the children will be dragable
 */
function initializeDragSource(elementId) {
	if($("#"+elementId).length > 0) {
		dragSources[dragSources.length] = $("#"+elementId);
		$("#"+elementId).children().mouseover(dragMouseOver);
		$("#"+elementId).children().mouseout(dragMouseOut);
	}
	else {
		alert( "Could not initialize element with id " + elementId + " as a drag source! " );
	}
}

function dragMouseOver(e) {
	//only the immediate children of the source are draggable, need to find it based on the actual mouse over target
	$dragSource = getDragSource($(e.target));
	if( $dragSource != undefined ) {
		$dragSource.css("border", "1px solid #FF0000");
	}
}

function dragMouseOut(e) {
	$dragSource = getDragSource($(e.target));
	if( $dragSource != undefined ) {
		$dragSource.css("border", "0");
	}
}

function getDragSource($element) {
	$parents = $element.parents();
	
	for( var parentIdx = 0 ; parentIdx < $parents.length ; parentIdx ++ ) {
		if( isDragSource($($parents[parentIdx])) ) {
			//reached the drag source, it means that the draggable element is at the previous index
			if( parentIdx == 0 ) {
				return $element;
			}
			else {
				return $($parents[parentIdx - 1]);				
			}
		}
	}
	
	return undefined;
}

function isDragSource($element) {
	for( var i = 0 ; i < dragSources.length ; i++ ) {
		if( dragSources[i][0] === $element[0] ) {
			return true;
		}
	}
	
	return false;
}
