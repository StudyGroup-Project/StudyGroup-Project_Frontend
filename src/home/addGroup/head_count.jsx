import styled from 'styled-components'
import {useState} from 'react'

function HeadCount(props){
    let headCount = props.headCount;
    let setHeadCount = props.setHeadCount;
    let [open, setOpen] = useState(false);
    let [curValue, setCurValue] = useState(headCount);

    return(
        <>
            <SelectBox onClick={()=>{
                setOpen(!open)
            }}>
                <Label>{curValue}</Label>
                <SelectOptions show={open}>
                {
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(a, i){
                        return(
                            <Option key={i} onClick={(e)=>{
                                e.stopPropagation();
                                setCurValue(i);
                                setHeadCount(i);
                                setOpen(false);
                            }}>{i}</Option>
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
    align-items:center;
    align-self: flex-start;
    margin-top: -7px;
    justify-content: space-between;
    padding:  15px;
    width: 60px;
    border-radius: 12px;
    height: 40px;
    background-color: #E6E6E6;
    cursor: pointer;
    &::before {
        content: "⌵";
        position: absolute;
        top: 45%;
        transform: translate(0, -50%);
        right: 5%;
        color: #000;
        font-size: 15px;
    }
`;
const Label = styled.label`
  font-size: 16px;
`;
const SelectOptions = styled.ul`
  position: absolute;
  list-style: none;
  top: 100%;
  left: 0;
  width: 100%;
  overflow: auto;
  height: 90px;
  max-height: ${(props) => (props.show ? "none" : "0")};
  padding: 0;
  border-radius: 8px;
  background-color: #E6E6E6;
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
    background: #E6E6E6;  /* 스크롤바 뒷 배경 색상 */
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
    background-color: #fff;
  }
`;

export default HeadCount;