import React, {useEffect, useState} from 'react'
import { Modal } from 'react-bootstrap'
import { AssignFilterResponse } from '../../../app/modules/media/models/AssignFilterResponse'
import { getSelectMediaAssign, multipleAssignMedia } from '../../../app/modules/media/redux/MediaCRUD'
import { KTSVG } from '../../helpers'
import Message from './Message'

interface MultipleAssignProp{
    show: boolean
    handleClose: () => void
    media_ids: number[]
}

const MultipleAssign: React.FC<MultipleAssignProp> = ({show, handleClose, media_ids}) => {

    const [loading, setLoading] = useState(false)
    const [filterState, setFilterState]         = useState({"event": "", "round": "", "day": "", "moment": ""});
    const [assignFilters, setAssignFilters ]    = useState<AssignFilterResponse>();
    const [messageModal, setMessageModal] = useState({"show": false, "message": "", "type": ""})

    const onSelectChange = (e: React.FormEvent<HTMLSelectElement>) => {
        let newValue      = e.currentTarget.value;
        let selectClicked = e.currentTarget.name;
        //
        switch(selectClicked){
            case "event":
                setFilterState({...filterState, event: newValue});
                break;
            case "round":
                setFilterState({...filterState, round: newValue});
                break;
            case "day":
                setFilterState({...filterState, day: newValue});
                break;
            case "moment":
                setFilterState({...filterState, moment: newValue});
                break;
        }
    }
    const onHide = () => {
        setLoading(false)
    }

    useEffect(() => {
        refreshFilters(filterState.event, filterState.round, filterState.day)
    }, [filterState])

    const confirmAssing = () => {
        multipleAssignMedia(parseInt(filterState.day), media_ids, parseInt(filterState.moment)).then(function(data){
            setFilterState({...filterState, event: "", round: "", day: "", moment: ""})
            handleClose()
            setMessageModal({...messageModal, show: true, message: "Medias associated correctly", "type": "success"})
        })

    }

    function refreshFilters(event: string, round: string, day: string) {
        getSelectMediaAssign(event, round, day).then( ( {data} ) => {
            setAssignFilters(data);
        });
    }



    return <>
            <Modal show={show} handleClose={handleClose} onExit={onHide} onHide={onHide}> 
                <div className="modal-header">
                    <h5 className="modal-title">Assign to Event</h5>
                    <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleClose}>
                        <KTSVG path='/media/icons/duotune/arrows/arr061.svg' className='svg-icon-1' />
                    </div>
                </div>
                <div className="modal-body">
                {
                    assignFilters?.data.events
                    ?
                    <div className='col-lg-12 fv-row mb-6'>
                        <label className='col-form-label fw-normal fs-6'>Assign event</label>
                        <select className='form-select form-select-solid form-select-lg fw-bold' name="event" onChange={onSelectChange} >
                            <option value=''>Assign event</option>
                            { assignFilters?.data?.events?.map((item, i) =>
                                <option key={i} value={item.event_id}>{item.title}</option> 
                            )}
                        </select>
                        <span className="text-gray-400 fw-normal">Assign an event to your media</span>
                    </div>
                    :
                    ""
                }
                {
                    assignFilters?.data.rounds && assignFilters?.data.rounds.length > 0
                    ?
                    <div className='col-lg-12 fv-row mb-6'>
                        <label className='col-form-label fw-normal fs-6'>Assign round</label>
                        <select className='form-select form-select-solid form-select-lg fw-bold' name="round"  onChange={onSelectChange} >
                            <option value=''>Assign Round</option>
                            { assignFilters?.data?.rounds?.map((item, i) =>
                                <option key={i} value={item.round_id}>{item.title}</option> 
                            )}
                        </select>
                        <span className="text-gray-400 fw-normal">Assign a round to your media</span>
                    </div>
                    :
                    ""
                }
                
                {
                    assignFilters?.data.days && assignFilters?.data.days.length > 0
                    ?
                    <div className='col-lg-12 fv-row mb-6'>
                        <label className='col-form-label fw-normal fs-6'>Assign day</label>
                        <select className='form-select form-select-solid form-select-lg fw-bold' name="day"  onChange={onSelectChange}>
                            <option value=''>Assign a day</option>

                            { assignFilters?.data?.days.map((item, i) =>
                                <option key={i} value={item.day_id}>{item.title}</option> 
                            )}
                        </select>
                        <span className="text-gray-400 fw-normal">Assign a day to your media</span>
                    </div>
                    :
                    ""
                }
                {
                    assignFilters?.data.moments && assignFilters?.data.moments.length > 0 && filterState.day !== ""
                    ?
                    <div className='col-lg-12 fv-row mb-6'>
                        <label className='col-form-label fw-normal fs-6'>Assign moment</label>
                        <select className='form-select form-select-solid form-select-lg fw-bold' name="moment"  onChange={onSelectChange}>
                            <option value=''>Assign a moment</option>
                            { assignFilters?.data?.moments?.map((item, i) =>
                                <option key={i} value={item.moment_tag_id}>{item.title}</option> 
                            )}
                        </select>
                        <span className="text-gray-400 fw-normal">Assign a moment to your media</span>
                    </div>
                    :
                    ""
                }
                </div>
                {
                filterState.event !== "" && filterState.round !== "" && filterState.day !== "" && filterState.moment !== ""
                ?
                <div className="modal-footer">
                    <button type="button" onClick={() => {
                        confirmAssing()
                    }} className="btn btn-primary">
                        {!loading && <span className='indicator-label'>Continue</span>}
                        {loading && (
                            <span className='indicator-progress' style={{display: 'block'}}>
                            Please wait...
                            <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                            </span>
                        )}
                    </button>
                </div>
                :
                ""
                }
            </Modal>
            <Message show={messageModal.show} message={messageModal.message} type={messageModal.type} handleClose={() => { setMessageModal({...messageModal, "show": false}) }} />
            </>
}

export default MultipleAssign