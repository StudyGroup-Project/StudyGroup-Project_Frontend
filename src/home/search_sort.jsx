import styled from 'styled-components'
import {useState} from 'react'


function SearchSort(props){
    let sortList = props.sortList;
    let setSortType = props.setSortType;
    let [open, setOpen] = useState(false);
    let [curValue, setCurValue] = useState('정렬 기준');

    let sortType = ['LATEST', 'TRUST_SCORE_DESC'];

    return(
        <>
            <SelectBox onClick={()=>{
                setOpen(!open)
            }}>
                <Label>{curValue}</Label>
                <SelectOptions show={open}>
                {
                    sortList.map(function(a, i){
                        return(
                            <Option key={i} onClick={(e)=>{
                                setCurValue(sortList[i]);
                                setSortType(sortType[i]);
                            }}>{sortList[i]}</Option>
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
    width: 100%;
    height: 20px;
    background-color: #fff;
    align-self: center;
    cursor: pointer;
`;
const Label = styled.label`
  font-size: 10px;
  cursor: pointer;
`;
const SelectOptions = styled.ul`
  display: ${(p)=>p.show?'block':'none'};
  position: absolute;
  list-style: none;
  top: 90%;
  right: 0px;
  width: 55px;
  overflow: hidden;
  height: auto;
  padding: 0;
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #000;
  color: #000;
  z-index:1000;
`;

const Option = styled.li`
  font-size: 10px;
  padding: 6px 8px;
  transition: background-color 0.2s ease-in;
  &:hover {
    background-color: #E6E6E6;
  }
  &:first-child {
    border-bottom: 1px solid #000;
  }
`;


export default SearchSort;
