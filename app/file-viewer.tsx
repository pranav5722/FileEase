import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import { useSettingsStore } from '../store/settingsStore';
import { useFileStore } from '../store/fileStore';
import colors from '../constants/colors';
import { Share2 } from 'lucide-react-native';
import { shareFile } from '../utils/fileUtils';

const { width, height } = Dimensions.get('window');

export default function FileViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);

  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;

  const files = useFileStore(state => state.files);
  const file = files.find(f => f.id === id);

  useEffect(() => {
    if (!file?.uri) {
      setLoading(false);
      return;
    }

    const loadFile = async () => {
      try {
        const info = await FileSystem.getInfoAsync(file.uri);
        if (!info.exists) {
          console.warn('File not found at URI:', file.uri);
          return;
        }

        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (file.type === 'document' && file.uri.endsWith('.pdf')) {
          setPdfBase64(base64);
        } else if (file.type === 'audio') {
          setAudioBase64(base64);
        } else if (file.type === 'video') {
          setVideoBase64(base64);
        }
      } catch (err) {
        console.warn('Failed to load file:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [file]);

  const renderPDFWebView = () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              background: ${theme.background};
              color: ${theme.text};
            }
            #viewer {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 16px;
            }
            canvas {
              margin: 10px 0;
              box-shadow: 0 4px 10px rgba(0,0,0,0.2);
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          <div id="viewer"></div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js"></script>
          <script>
            const base64 = "${pdfBase64}";
            const rawData = atob(base64);
            const loadingTask = pdfjsLib.getDocument({ data: rawData });

            loadingTask.promise.then(pdf => {
              for (let i = 1; i <= pdf.numPages; i++) {
                pdf.getPage(i).then(page => {
                  const viewport = page.getViewport({ scale: 1.5 });
                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d');
                  canvas.width = viewport.width;
                  canvas.height = viewport.height;
                  page.render({ canvasContext: context, viewport });
                  document.getElementById('viewer').appendChild(canvas);
                });
              }
            });
          </script>
        </body>
      </html>
    `;

    return (
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webViewer}
        javaScriptEnabled
        allowsInlineMediaPlayback
      />
    );
  };

  const renderAudioWebView = () => {
    const mime = file?.uri?.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="margin:0; background:${theme.background}; display:flex; justify-content:center; align-items:center; height:100vh;">
          <audio controls style="width:90%;  border-radius:10px; ">
            <source src="data:${mime};base64,${audioBase64}" type="${mime}" />
            Your browser does not support the audio element.
          </audio>
        </body>
      </html>
    `;

    return (
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webViewer}
        javaScriptEnabled
        allowsInlineMediaPlayback
      />
    );
  };

  const renderVideoWebView = () => {
    const mime = file?.uri?.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="margin:0; background:${theme.background}; display:flex; justify-content:center; align-items:center; height:100vh;">
          <video controls playsinline style="width:90%;  border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.25);">
            <source src="data:${mime};base64,${videoBase64}" type="${mime}" />
            Your browser does not support the video tag.
          </video>
        </body>
      </html>
    `;

    return (
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webViewer}
        javaScriptEnabled
        allowsInlineMediaPlayback
        allowsFullscreenVideo
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading file...</Text>
        </View>
      );
    }

    if (!file?.uri) {
      return (
        <View style={styles.unsupportedContainer}>
          <Text style={[styles.unsupportedText, { color: theme.text }]}>
            File not found or invalid.
          </Text>
        </View>
      );
    }

    switch (file.type) {
      case 'image':
        return (
          <Image
            source={{ uri: file.uri || file.thumbnail }}
            style={styles.imageViewer}
            contentFit="contain"
          />
        );
      case 'document':
        return pdfBase64 ? renderPDFWebView() : (
          <Text style={[styles.unsupportedText, { color: theme.text }]}>
            Invalid or unsupported PDF file.
          </Text>
        );
      case 'audio':
        return audioBase64 ? renderAudioWebView() : (
          <Text style={[styles.unsupportedText, { color: theme.text }]}>
            Could not load audio file.
          </Text>
        );
      case 'video':
        return videoBase64 ? renderVideoWebView() : (
          <Text style={[styles.unsupportedText, { color: theme.text }]}>
            Could not load video file.
          </Text>
        );
      default:
        return (
          <View style={styles.unsupportedContainer}>
            <Text style={[styles.unsupportedText, { color: theme.text }]}>
              Preview not available for this file type.
            </Text>
          </View>
        );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: file?.name || 'File Viewer',
          headerRight: () =>
            file?.uri ? (
              <Share2
                size={24}
                color={theme.text}
                style={{ marginRight: 16 }}
                onPress={() => shareFile(file.uri!)}
              />
            ) : null,
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderContent()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  imageViewer: {
    flex: 1,
    width,
    height: height * 0.7,
  },
  webViewer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unsupportedText: {
    fontSize: 16,
    textAlign: 'center',
  },
});