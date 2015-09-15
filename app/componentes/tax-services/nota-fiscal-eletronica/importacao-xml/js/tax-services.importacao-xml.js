/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("tax-services-importacao-xml", []) 

.controller("tax-services-importacao-xmlCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            '$window',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',    
                                            function($scope,$state,$http,$window,/*$campos,*/
                                                     $webapi,$apis,$timeout){ 
   
    $scope.paginaInformada = 1;
    $scope.filiais = [];   
    $scope.manifestos = [];                                            
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.statusmanifesto = [/*{id: 1, nome : 'MANIFESTO'},
                                {id: 2, nome : 'ERP'}*/];                                        
    $scope.filtro = { datamin : new Date(), datamax : '',
                      statusmanifesto : null, destinatario : null, emitente : '',
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0}; 
    $scope.total = { nfe : 0 };  
    $scope.notadetalhada = undefined;                                            
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyManifestoPos = 1; // posição da div que vai receber o loading progress                                         
    // flags
    var ultimoFiltroBusca = undefined;
    $scope.tab = 1;
    $scope.exibeTela = false;                                         
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                                            
                                                
    // Inicialização do controller
    $scope.taxServices_importacaoXMLInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Nota Fiscal Eletrônica';                          
        $scope.pagina.subtitulo = 'Importação XML';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.destinatario = null;
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            buscaFiliais();
        }); 
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        buscaFiliais();
    };                                           
                                                
                                            
    
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaManifestos(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.manifestos.length > 0) buscaManifestos();    
    };
                                                
                                                
        
                                                
   /* FILTRO */
                                                
   /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
        var filtros = [];
        
       // Data
       var filtroData = {id: /*$campos.tax.tbmanifesto.dtEmissao*/ 108,
                         valor: $scope.getFiltroData($scope.filtro.datamin)}; 
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       filtros.push(filtroData);
        
       // Destinatário
       if($scope.filtro.destinatario && $scope.filtro.destinatario !== null){
           filtros.push({id: /*$campos.tax.tbmanifesto.nrCNPJ*/ 104, 
                         valor: $scope.filtro.destinatario.nu_cnpj});  
       }
        
        // Emitente
        if($scope.filtro.emitente && $scope.filtro.emitente !== ''){
            filtros.push({id: /*$campos.card.tbbancoparametro.nmEmitente */ 106,
                          valor: '%' + $scope.filtro.emitente});
        }
        
        // Status Manifesto
        if($scope.filtro.statusmanifesto && $scope.filtro.statusmanifesto !== null){
            filtros.push({id: /*$campos.tax.tbmanifesto.cdSituacaoManifesto */ 113,
                          valor: $scope.filtro.statusmanifesto.id}); 
        }
        return filtros.length > 0 ? filtros : undefined;
    }                                             
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        ultimoFiltroBusca = undefined;
        
        $scope.filtro.destinatario = $scope.filtro.statusmanifesto = null; 
        
        $scope.filtro.emitente = '';

    }
    
    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.filtro.datamax && $scope.filtro.datamax < $scope.filtro.datamin) $scope.filtro.datamax = $scope.filtro.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
      ajustaIntervaloDeData();
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
      };
    $scope.alterouDataMax = function(){
       if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
       else ajustaIntervaloDeData();
    };
                                                 
    
    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(nu_cnpj){
        
       if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return;
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros = [{id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo}];
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.destinatario = null;
                else $scope.filtro.destinatario = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouDestinatario = function(){
        //console.log($scope.filtro.destinatario); 
    }; 
                                                
                                                
                                                
    
                                                
    // MANIFESTO
    $scope.incrementaTotalNFes = function(totalNotas){
        if(typeof totalNotas === 'number') $scope.total.nfe += totalNotas;    
    }
    /**
      * Obtem os manifestos a partir dos filtros
      */
    $scope.buscaManifestos = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        /*if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           return;
        }*/
        // Intervalo de data
        if($scope.filtro.datamax){
            var timeDiff = Math.abs($scope.filtro.datamax.getTime() - $scope.filtro.datamin.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            if(diffDays > 31){
                var periodo = diffDays <= 366 ? diffDays + ' dias' : 'mais de um ano';
                $scope.showModalAlerta('Por favor, selecione um intervalo de data de no máximo 31 dias. (Sua seleção consta ' + periodo + ')', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.exibeCalendarioDataMax();}, 300);
                                    }
                                  );
                return; 
            }
        }
        // Nova busca
        buscaManifestos();
    }
                                                
                                                
    var buscaManifestos = function(){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyManifestoPos);
        
       // Filtros    
       var filtros = obtemFiltrosBusca();
           
       //console.log(filtros);
       
       $webapi.get($apis.getUrl($apis.tax.tbmanifesto, 
                                [$scope.token, 5, /* $campos.tax.tbmanifesto.dtemissao */108, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){
                // Guarda o último filtro utilizado
                ultimoFiltroBusca = filtros;
           
                // Reseta total de manifestos
                $scope.total.nfe = 0;
                // Obtém os dados
                $scope.manifestos = dados.Registros;
           
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.manifestos.length === 0) $scope.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyManifestoPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter manifestos (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyManifestoPos);
              });           
    }
                                                
                                                
                                                
    // TABELA EXPANSÍVEL
    $scope.toggle = function(manifesto){
        if(!manifesto || manifesto === null) return;
        if(manifesto.collapsed) manifesto.collapsed = false;
        else manifesto.collapsed = true;
    }
    $scope.isExpanded = function(manifesto){
        if(!manifesto || manifesto === null) return;
        return manifesto.collapsed;
    }
    
    
    
    
    // AÇÕES
    /** 
      * Requisita o download
      */
    var download = function(url, arquivo){
        $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
        $scope.showProgress(divPortletBodyManifestoPos);
        
        $http.get(url, {responseType: 'arraybuffer'}) 
            .success(function(data, status, headers, config){
                //console.log(dados);
            
                var octetStreamMime = 'application/octet-stream';
                var success = false;

                // Get the headers
                headers = headers();
            
                //console.log(headers);

                // Get the filename from the x-filename header or default to "download.bin"
                var filename = headers['x-filename'] || arquivo;
            
                // Determine the content type from the header or default to "application/octet-stream"
                var contentType = headers['content-type'] || octetStreamMime;

                try
                {
                    // Try using msSaveBlob if supported
                    //console.log("Trying saveBlob method ...");
                    var blob = new Blob([data], { type: contentType });
                    if(navigator.msSaveBlob)
                        navigator.msSaveBlob(blob, filename);
                    else {
                        // Try using other saveBlob implementations, if available
                        var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                        if(saveBlob === undefined) throw "Not supported";
                        saveBlob(blob, filename);
                    }
                    //console.log("saveBlob succeeded");
                    success = true;
                } catch(ex)
                {
                    //console.log("saveBlob method failed with the following exception:");
                    //console.log(ex);
                }
            
                if(!success)
                {
                    // Get the blob url creator
                    var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                    if(urlCreator)
                    {
                        // Try to use a download link
                        var link = document.createElement('a');
                        if('download' in link)
                        {
                            // Try to simulate a click
                            try
                            {
                                // Prepare a blob URL
                                //console.log("Trying download link method with simulated click ...");
                                var blob = new Blob([data], { type: contentType });
                                var url = urlCreator.createObjectURL(blob);
                                link.setAttribute('href', url);

                                // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                                link.setAttribute("download", filename);

                                // Simulate clicking the download link
                                var event = document.createEvent('MouseEvents');
                                event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                                link.dispatchEvent(event);
                                //console.log("Download link method with simulated click succeeded");
                                success = true;

                            } catch(ex) {
                                //console.log("Download link method with simulated click failed with the following exception:");
                                //console.log(ex);
                            }
                        }

                        if(!success)
                        {
                            // Fallback to window.location method
                            try
                            {
                                // Prepare a blob URL
                                // Use application/octet-stream when using window.location to force download
                                //console.log("Trying download link method with window.location ...");
                                var blob = new Blob([data], { type: octetStreamMime });
                                var url = urlCreator.createObjectURL(blob);
                                window.location = url;
                                //console.log("Download link method with window.location succeeded");
                                success = true;
                            } catch(ex) {
                                //console.log("Download link method with window.location failed with the following exception:");
                                //console.log(ex);
                            }
                        }

                    }
                }

                if(!success)
                {
                    // Fallback to window.open method
                    //console.log("No methods worked for saving the arraybuffer, using last RESORT window.open");
                    window.open(url, '_blank', '');
                }

            
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyManifestoPos);
            }).error(function(data, status, headers, config){
                 if(status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(status === 503 || status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao realizar o download (' + status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyManifestoPos);
            });           
    }
    /** 
      * Download DANFE
      */
    $scope.downloadDANFE = function(manifesto, indexNota){
        var filtro = undefined;
        var colecao = 3; // default : todas
        var filename = manifesto.nrEmitenteCNPJCPF + '.zip';
        if(typeof indexNota === 'number'){
            // Apenas uma nota
            var nota = manifesto.notas[indexNota];
            //console.log("DOWNLOAD DANFE " + manifesto.nmEmitente.toUpperCase());
            //console.log(nota);
            colecao = 2;
            // filtro
            filtro = {id : /* $campos.tax.tbManifesto.idManifesto */ 100,
                      valor : nota.idManifesto};
            filename = nota.nrChave + '.pdf';
        }else{ 
            // Todas as notas  
            if(ultimoFiltroBusca){
                filtro = [];
                angular.copy(ultimoFiltroBusca, filtro);
                filtro.push({id : /*$campos.tax.tbmanifesto.nrEmitenteCNPJCPF*/105,
                             valor: manifesto.nrEmitenteCNPJCPF});
            }else
                filtro = {id : /*$campos.tax.tbmanifesto.nrEmitenteCNPJCPF*/105,
                          valor: manifesto.nrEmitenteCNPJCPF};
        }
        download($apis.getUrl($apis.util.utilnfe, [$scope.token, colecao, /*$campos.tax.tbmanifesto.dtEmissao*/ 108], filtro),
                 filename);
    }
    /** 
      * Download XML
      */
    $scope.downloadXML = function(manifesto, indexNota){
        var filtro = undefined;
        var colecao = 1; // default : todas
        var filename = manifesto.nrEmitenteCNPJCPF + '.zip';
        if(typeof indexNota === 'number'){
            // Apenas uma nota
            var nota = manifesto.notas[indexNota];
            //console.log(nota);
            //console.log("DOWNLOAD XML " + manifesto.nmEmitente.toUpperCase());
            //console.log(nota);
            colecao = 0;
            // filtro
            filtro = {id : /* $campos.tax.tbManifesto.idManifesto */ 100,
                      valor : nota.idManifesto};
            filename = nota.nrChave + '.xml';
        }else{ 
            // Todas as notas  
            if(ultimoFiltroBusca){
                filtro = [];
                angular.copy(ultimoFiltroBusca, filtro);
                filtro.push({id : /*$campos.tax.tbmanifesto.nrEmitenteCNPJCPF*/105,
                             valor: manifesto.nrEmitenteCNPJCPF});
            }else
                filtro = {id : /*$campos.tax.tbmanifesto.nrEmitenteCNPJCPF*/105,
                          valor: manifesto.nrEmitenteCNPJCPF};
        }
        download($apis.getUrl($apis.util.utilnfe, [$scope.token, colecao, /*$campos.tax.tbmanifesto.dtEmissao*/ 108], filtro),
                 filename);
    }
    
    
    
    
    
    
    // DETALHES
    /**
      * Obtém string com '<código> - <descricao/nome>'
      */
    $scope.getCodigoTracoDescricao = function(obj){
        var text = '';
        if(obj){
            if(typeof obj.codigo === 'number' || typeof obj.codigo === 'string'){ 
                text = obj.codigo + '';
                if(typeof obj.descricao === 'string') text += ' - ' + obj.descricao;
                else if(typeof obj.nome === 'string') text += ' - ' + obj.nome;
            }else if(typeof obj.descricao === 'string') text = obj.descricao;
            else if(typeof obj.nome === 'string') text = obj.nome;
        }
        return text;//.toUpperCase();
    }
    
    /**
      * Requisita informações detalhadas da nota fiscal eletrônica
      */
    var obtemDetalhesNota = function(idManifesto, nrChave, funcaoSucesso){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyManifestoPos);
        
       // Filtros    
       var filtro = {id : /*$campos.tax.tbmanifesto.idManifesto*/ 100,
                     valor : idManifesto};
           
       //console.log(filtros);
       
       $webapi.get($apis.getUrl($apis.tax.tbmanifesto, [$scope.token, 4], filtro)) 
            .then(function(dados){
                // Obtém os dados
                $scope.notadetalhada = undefined;
           
                if(dados.Registros.length > 0){ 
                    $scope.notadetalhada = dados.Registros[0].notas[0];
                    $scope.notadetalhada.nrChave = nrChave;
                }

                if(typeof funcaoSucesso === 'function') funcaoSucesso();
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyManifestoPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter detalhes da NF-e (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyManifestoPos);
              });     
    }
    
    /** 
      * Detalha a nota
      */
    $scope.detalhar = function(manifesto, indexNota){
        var nota = manifesto.notas[indexNota];
        //console.log("DETALHAR " + manifesto.nmEmitente.toUpperCase());
        //console.log(nota);
        if(!$scope.notadetalhada || $scope.notadetalhada.idManifesto !== nota.idManifesto)
            obtemDetalhesNota(nota.idManifesto, nota.nrChave, function(){$('#modalDetalhes').modal('show');});
        else
            $('#modalDetalhes').modal('show');
    }
    
    
    /** 
      * Imprime a nota
      */
    $scope.imprimir = function(manifesto, indexNota){
        var nota = manifesto.notas[indexNota];
        //console.log("IMPRIMIR " + manifesto.nmEmitente.toUpperCase());
        //console.log(nota);
        $window.open('views/impressao-nfe#?k=' + nota.nrChave + '&t='+$scope.token, '_blank');
        //obtemDetalhesNota(nota.idManifesto, function(){ /* abre nova aba */});
    }
        
        
    
    
    //TAB
    /**
      * Retorna true se a tab informada corresponde a tab em exibição
      */
    $scope.tabIs = function (tab){
        return $scope.tab === tab;
    }
    /**
      * Altera a tab em exibição
      */
    $scope.setTab = function (tab){
        if (tab >= 1 && tab <= 8) $scope.tab = tab;        
    }
       
    
}])