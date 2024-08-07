import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Download } from 'lucide-react';

const Index = () => {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      complete: (results) => {
        setHeaders(results.data[0]);
        setCsvData(results.data.slice(1));
      },
      header: false,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleCellEdit = (rowIndex, columnIndex, value) => {
    const newData = [...csvData];
    newData[rowIndex][columnIndex] = value;
    setCsvData(newData);
  };

  const addNewRow = () => {
    const newRow = new Array(headers.length).fill('');
    setCsvData([...csvData, newRow]);
  };

  const deleteRow = (rowIndex) => {
    const newData = csvData.filter((_, index) => index !== rowIndex);
    setCsvData(newData);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse([headers, ...csvData]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'edited_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">CSV Editor</h1>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV file here ...</p>
        ) : (
          <p>Drag 'n' drop a CSV file here, or click to select a file</p>
        )}
      </div>
      {csvData.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  {headers.map((header, index) => (
                    <Table.Head key={index}>{header}</Table.Head>
                  ))}
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {csvData.map((row, rowIndex) => (
                  <Table.Row key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <Table.Cell key={cellIndex}>
                        <Input
                          value={cell}
                          onChange={(e) =>
                            handleCellEdit(rowIndex, cellIndex, e.target.value)
                          }
                          className="w-full"
                        />
                      </Table.Cell>
                    ))}
                    <Table.Cell>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteRow(rowIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          <div className="mt-4 flex justify-between">
            <Button onClick={addNewRow}>
              <Plus className="mr-2 h-4 w-4" /> Add Row
            </Button>
            <Button onClick={downloadCSV}>
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
