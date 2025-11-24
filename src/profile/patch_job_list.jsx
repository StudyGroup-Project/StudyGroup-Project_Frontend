import styled from 'styled-components'
import './category_list.css'
import { useState, useEffect } from 'react'

function PatchJobList(props) {
    let list = props.list;
    let setUserData = props.setUserData;
    let [open, setOpen] = useState(false);
    let [curValue, setCurValue] = useState(list[0]);

    let EngJob = {
        선택안함: '선택안함',
        학생: 'STUDENT',
        회사원: 'OFFICE_WORKER',
        프리랜서: 'FREELANCER',
        취업준비생: 'JOB_SEEKER',
        기타: 'OTHER'
    }

    useEffect(() => {
        setUserData(EngJob[curValue]);
      }, [curValue, setUserData]);

    return (
        <>
            <SelectBox onClick={() => {
                setOpen(!open)
            }}>
                <Label>{curValue}</Label>
                <SelectOptions show={open}>
                    {
                        list.map(function (a, i) {
                            return (
                                <Option key={i} onClick={(e) => {
                                    setCurValue(list[i]);
                                }}>{list[i]}</Option>
                            )
                        })
                    }
                </SelectOptions>
            </SelectBox>
        </>
    )
}

const SelectBox = styled.div`
    position: relative;
    display:flex;
    align-items:right;
    width: 100%;
    padding: 10px 0px;
    border-radius: 12px;
    height: 40px;
    background-color: #fff;
    align-self: center;
    cursor: pointer;
    &::before {
        content: "⌵";
        position: absolute;
        top: 20%;
        right: 5%;
        color: #000;
        font-size: 20px;
    }
`;
const Label = styled.label`
  font-size: 16px;
`;
const SelectOptions = styled.ul`
  position: absolute;
  list-style: none;
  top: 110%;
  left: 0;
  width: 100%;
  overflow: auto;
  height: 90px;
  max-height: ${(props) => (props.show ? "none" : "0")};
  padding: 0;
  border-radius: 8px;
  background-color: #fff;
  color: #000;
  z-index:1;

  &::-webkit-scrollbar{
    width:8px;
  }

  &::-webkit-scrollbar-thumb {
    height: 20%; /* 스크롤바의 길이 */
    background: #000; /* 스크롤바의 색상 */
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #fff;  /* 스크롤바 뒷 배경 색상 */
  }
`;
const Option = styled.li`
  font-size: 14px;
  padding: 6px 8px;
  transition: background-color 0.2s ease-in;
  border-bottom: 1px solid #E6E6E6;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #E6E6E6;
  }
`;

export default PatchJobList;