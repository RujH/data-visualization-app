import React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const DraggableResizableBox: React.FC = () => {
  return (
    <Draggable>
      <div style={{ position: 'absolute', zIndex: 1000 }}>
        <ResizableBox
          width={200}
          height={200}
          minConstraints={[100, 100]}
          maxConstraints={[500, 500]}
          style={{
            border: '2px solid tomato',
            backgroundColor: 'lightblue',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '100%', height: '100%', textAlign: 'center' }}>
            Drag me and Resize me!
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default DraggableResizableBox;
