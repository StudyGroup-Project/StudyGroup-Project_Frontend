import styled from 'styled-components'
import {useState} from 'react'

function SearchCategory(props){
    let category = props.category;
    let setNewCategory = props.setNewCategory;
    let [open, setOpen] = useState(false);
    let [curValue, setCurValue] = useState(category[0]);

    return(
        <>
            <SelectBox onClick={()=>{
                setOpen(!open)
            }}>
                <Label>{curValue}</Label>
                <SelectOptions show={open}>
                {
                    category.map(function(a, i){
                        return(
                            <Option key={i} onClick={(e)=>{
                                setCurValue(category[i]);
                                setNewCategory(category[i]);
                            }}>{category[i]}</Option>
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
    width: 20%;
    border-radius: 12px;
    height: 40px;
    padding: 8px;
    background-color: #fff;
    align-self: center;
    cursor: pointer;
    &::before {
        content: "⌵";
        position: absolute;
        top: 25%;
        right: 15%;
        color: #000;
        font-size: 11px;
    }
`;
const Label = styled.label`
  font-size: 12px;
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
    height: 5%; /* 스크롤바의 길이 */
    background: #c6c6c6; /* 스크롤바의 색상 */
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #E6E6E6;  /* 스크롤바 뒷 배경 색상 */
  }
`;
const Option = styled.li`
  font-size: 12px;
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


export default SearchCategory;
