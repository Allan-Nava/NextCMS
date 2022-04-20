/*
 * File: button.js
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 10:15:44 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 27th March 2022 10:25:02 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
export default function Button(props) {
    var className = `${props.className == null || props.className == "" ? "" : " " + props.className }`;
    var text = props.text
    var disabled = props.disabled
    
    if (props.loading) {
        disabled = true
    }

    if (props.circular) {
        className = className + " hm-button-circular"
        return (
            <button type="button" className={"hm-button" + className} onClick={props.onClick} disabled={props.disabled} data-bs-toggle="tooltip" data-bs-placement="bottom" title={text}>
                <i className={props.icon}></i>
            </button>
        )
    }

    if (props.dismiss) {
        return (
            <button type="button" className={"hm-button" + className} onClick={props.onClick} disabled={props.disabled} data-bs-dismiss="modal">
                {text}
            </button>
        ); 
    }
    
    return (
        <button className={"hm-button" + className} onClick={props.onClick} disabled={ disabled } >
            {props.icon ? <i className={props.icon}></i> : "" }
            {props.loading ? "Attendi..." : text }
        </button>
    );
}
