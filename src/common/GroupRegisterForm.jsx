import { useState } from 'react';
import axios from 'axios';
import '../Group/group_profile.css';
import './GroupRegisterForm.css';

function ApplicationModal({ studyId, onClose, onSubmitSuccess }) {
    const [text, setText] = useState('');

    const handleSubmit = async () => {
        if (text.trim().length === 0) {
            alert('가입 신청 메시지를 입력해주세요.');
            return;
        }
        const accessToken = localStorage.getItem('accessToken');
        let res = await axios.post(
            `http://3.39.81.234:8080/api/studies/${studyId}/applications`,
            { content: text }, 
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true
            }
        );
        if(res.status === 200 || res.status === 201){
            alert("지원서를 전송하였습니다.");
            onSubmitSuccess(); 
        }
        else {
            alert("지원서 전송에 실패하였습니다.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <textarea
                    className="modal-textarea"
                    placeholder="내용을 작성해 주세요."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <div className="modal-buttons">
                    <button
                        className="modal-btn-submit"
                        onClick={handleSubmit}
                    >
                        제출
                    </button>
                    <button
                        className="modal-btn-close"
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApplicationModal; 