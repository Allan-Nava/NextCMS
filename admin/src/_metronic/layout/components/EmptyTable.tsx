import React from "react";

const EmptyTable: React.FC<{message: string}> = ({message}) => {
    return <table className='table align-middle gs-0 gy-4'>
                <thead>
                    <tr className='fw-bolder text-muted'>
                        <th className='min-w-140px'></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='w-100 text-center'><span className='fw-bold fs-6'>{message}</span></td>
                    </tr>
                </tbody>
            </table>
}

export default EmptyTable