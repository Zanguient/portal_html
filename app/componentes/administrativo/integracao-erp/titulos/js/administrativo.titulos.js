/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 * 
 *  Versão 1.0.8 - 12/05/2016
 *  - Controller de upload alterado
 *
 *  Versão 1.0.7 - 06/05/2016
 *  - Importação por data de venda
 *
 *  Versão 1.0.6 - 29/04/2016
 *  - Avalia nsu
 *
 *  Versão 1.0.5 - 27/04/2016
 *  - Mensagem do erro da importação
 *
 *  Versão 1.0.4 - 10/03/2016
 *  - Filtros
 *
 *  Versão 1.0.3 - 09/12/2015
 *  - Upload de arquivo CSV
 *
 *  Versão 1.0.2 - 25/11/2015
 *  - Totais
 *
 *  Versão 1.0.1 - 23/11/2015
 *  - Consulta títulos da base da atos
 *
 *  Versão 1.0 - 18/11/2015
 *
 */

// App
angular.module("administrativo-titulos", []) 

.controller("administrativo-titulosCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             '$http',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             'Upload',
                                             '$autenticacao',
                                             function($scope,$state,$filter,$timeout,$http,
                                                      /*$campos,*/$webapi,$apis,Upload,$autenticacao){ 
    
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200];                                             
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Dados    
    $scope.titulos = [];
    $scope.filiais = [];
    $scope.adquirentes = [];
    $scope.filtro = { dtImportacao : new Date(), dataImportacao : 'Recebimento', data : 'Recebimento',
                      datamin : new Date(), datamax : '', consideraPeriodo : true,
                      filial : null, adquirente : null, nsu : '',
                      itens_pagina : $scope.itens_pagina[0], order : 0, 
                      pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };   
    $scope.total = { valorTotal : 0.0, totalBaixados : 0, totalConciliados : 0};                                             
    var divPortletBodyImportacaoPos = 0;                                             
    var divPortletBodyFiltrosPos = 1; // posição da div que vai receber o loading progress
    var divPortletBodyTitulosPos = 2;                                                    
    // Permissões                                           
    //var permissaoAlteracao = false;
    var permissaoCadastro = false;
    //var permissaoRemocao = false;
    // UPLOAD
    var uploadEmProgresso = false;                                             
    // Flags
    $scope.exibeTela = false;  
    $scope.abrirCalendarioDataImportacao = false;  
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                              
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_titulosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Títulos';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    $scope.filtro.filial = $scope.filtro.adquirente = null;
                    buscaFiliais(true);
                }else{ // reseta filiais e refaz a busca dos parâmetros 
                    $scope.filtro.filial = $scope.filtro.adquirente = null;
                    $scope.titulos = [];
                    $scope.filiais = [];
                    $scope.adquirentes = [];
                }
                
            }
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            //permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            //permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            if($scope.usuariologado.grupoempresa){
                buscaFiliais(true);
            }
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        //$scope.exibeTela = true;
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar títulos
      */
    $scope.usuarioPodeCadastrarTitulos = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar títulos
      * /
    $scope.usuarioPodeAlterarTitulos = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir títulos
      * /
    $scope.usuarioPodeExcluirTitulos = function(){
        return permissaoRemocao;
    }  */                                            
                                                 
    
    
                                                                                            
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaTitulos();
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
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.titulos.length > 0) buscaTitulos();
    }; 
          
                                                 
                                                 
                                                 
    // DATA IMPORTAÇÃO
    $scope.exibeCalendarioDataImportacao = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataImportacao = !$scope.abrirCalendarioDataImportacao;
    }; 
                                                 
                                                 
    // DATA RECEBIMENTO
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
    var buscaFiliais = function(buscarAdquirentes, nu_cnpj, cdAdquirente){
        
       $scope.showProgress(divPortletBodyImportacaoPos, 10000);    
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];
        
       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, 
                         valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.filial = null;
                else $scope.filtro.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                //$scope.filtro.filial = $scope.filiais.length > 0 ? $scope.filiais[0] : null;
                //if($scope.filtro.filial && $scope.filtro.filial !== null)
                if(buscarAdquirentes)
                    buscaAdquirentes(true, cdAdquirente); // Busca adquirentes
                else{
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyImportacaoPos);
                }
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyImportacaoPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.filial); 
        buscaAdquirentes(false);
    };
    
                                                                                         
    // ADQUIRENTES 
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressEstaAberto, cdAdquirente){
 
       if(!progressEstaAberto){ 
           $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
           $scope.showProgress(divPortletBodyImportacaoPos, 10000);
       }
        
       var filtros = [{id : /*$campos.card.tbadquirente.stAdquirente*/ 103,
                       valor : 1}];
        
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           // Filtro do grupo empresa => barra administrativa
           filtros.push({id: /*$campos.card.tbadquirente.cnpj*/ 305,
                         valor: $scope.filtro.filial.nu_cnpj});
       }     
       
       $webapi.get($apis.getUrl($apis.card.tbadquirente, 
                                [$scope.token, 1, /*$campos.card.tbadquirente.nmAdquirente*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(typeof cdAdquirente === 'number' && cdAdquirente > 0) 
                    $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.cdAdquirente === cdAdquirente;})[0];
                else $scope.filtro.adquirente = null;
                
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyImportacaoPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyImportacaoPos);
              });        
    }
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(){
        // ....
    };                                             
                                                 
                                                 
                                                 
                                                 
                                                 
    
        
    // BUSCA TÍTULOS
    /**
      * Faz a busca baseado nos filtros selecionados
      */
    $scope.buscaTitulos = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        buscaTitulos();    
    }
    
    
    $scope.limpaFiltros = function(){
        // Limpar data => Refazer busca?
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        $scope.filtro.adquirente = $scope.filtro.filial = null; 
        $scope.filtro.nsu = '';
        $scope.filtro.consideraPeriodo = true;
    }
    
    /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
       var filtros = [];
        
       // Data
       var filtroData;
       if($scope.filtro.data === 'Venda') filtroData = {//id: $campos.card.tbrecebimentotitulo.dtVenda,
                          id: 103,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};  
       else filtroData = {id: /*$campos.card.tbrecebimentotitulo.dtTitulo*/ 109,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       //filtros.push(filtroData);
        
        
       // Filial
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           var filtroFilial = {id: 101,//$campos.card.tbrecebimentotitulo.nrCNPJ  
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // Adquirente
       if($scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: 104,//$campos.card.tbrecebimentotitulo.cdAdquirente, 
                                   valor: $scope.filtro.adquirente.cdAdquirente};
           filtros.push(filtroAdquirente);
       } 
        
        
        //NSU
        if($scope.filtro.nsu !== null && $scope.filtro.nsu){
            var filtroNSU = {id: /*$campos.card.tbrecebimentotitulo.nrNsu*/ 102,
                             valor: $scope.filtro.nsu + '%'};
            filtros.push(filtroNSU);
            
            // Considera período?
            if($scope.filtro.consideraPeriodo !== false)
                filtros.push(filtroData);
        }
        else
            // Sem nsu => considera filtro de data
            filtros.push(filtroData);

        
        return filtros;
    }
                                           
    /**
      * Busca títulos
      */
    var buscaTitulos = function(progressosemexecucao){

        if(!progressosemexecucao){
            $scope.showProgress(divPortletBodyImportacaoPos, 10000);
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyTitulosPos);
        }
        
        // Filtro  
        var filtros = obtemFiltrosBusca();
        
        var order = $scope.filtro.data === 'Venda' ? /*$campos.card.tbrecebimentotitulo.dtVenda*/ 103 :
                                                     /*$campos.card.tbrecebimentotitulo.dtTitulo*/ 109; 
        
        $webapi.get($apis.getUrl($apis.card.tbrecebimentotitulo,
                                [$scope.token, 3, order, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                $scope.total.totalBaixados = $scope.total.totalConciliados = 0;
                $scope.total.valorTotal = 0.0;
            
                // Obtém os dados
                $scope.titulos = dados.Registros;
                console.log(dados.Registros);
                $scope.total.totalBaixados = dados.Totais.totalBaixados;
                $scope.total.totalConciliados = dados.Totais.totalConciliados;
                $scope.total.valorTotal = dados.Totais.valorTotal;
                
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.titulos.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }

                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha o progress
                $scope.hideProgress(divPortletBodyImportacaoPos);
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyTitulosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao carregar títulos (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                $scope.hideProgress(divPortletBodyImportacaoPos);
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyTitulosPos);
              });  
    };
                                                 
                                                 
    // IMPORTA TÍTULOS
    $scope.importaTitulos = function(){

        if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return; 
        if(!$scope.usuariologado.grupoempresa.dsAPI || $scope.usuariologado.grupoempresa.dsAPI === null){
            $scope.showModalAlerta('Empresa não possui serviço ativo!');
            return;
        }
        
        // Funcionalidade de importação por data de venda só funciona para o SPRESS
        if($scope.filtro.dataImportacao === 'Venda' && $scope.usuariologado.grupoempresa.dsAPI !== 'apispress' && $scope.usuariologado.grupoempresa.dsAPI !== 'apirezendealpha'){
            $scope.showModalAlerta('Empresa não possui serviço de importação de títulos por data de venda!');
            return;
        }
        
        $scope.showProgress(divPortletBodyImportacaoPos, 10000);
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyTitulosPos);
        
        var json = { data : $scope.getFiltroData($scope.filtro.dtImportacao),
                     tipoData : $scope.filtro.dataImportacao === 'Venda' ? 'V' : 'R' };
        
        // Requisita 
        $webapi.post($apis.getUrl($apis.card.tituloserp, undefined,
                                  {id : 'token', valor: $scope.token}), 
                                  json) 
            .then(function(dados){           

                $scope.showAlert('Títulos importados com sucesso!', true, 'success', true);
                
                buscaTitulos(true);
                // Fecha o progress
                // $scope.hideProgress(divPortletBodyImportacaoPos);
                // $scope.hideProgress(divPortletBodyFiltrosPos);
                // $scope.hideProgress(divPortletBodyTitulosPos);
              },
              function(failData){
                 //console.log(failData);
                 if(failData.status === 0) $scope.showAlert('O servidor está demorando muito para responder. O processo de importação ainda está sendo realizado. Por favor, realize a consulta dos títulos mais tarde.', true, 'warning', true, true, 0); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else if(failData.status === 401) $scope.showModalAlerta(failData.dados);
                 else //$scope.showAlert('Houve uma falha ao carregar títulos (' + failData.status + ')', true, 'danger', true);
                    $scope.showModalAlerta('Houve uma falha ao importar os títulos. (' + (failData.dados && failData.dados !== null ? failData.dados : failData.status) + ')', 'Erro');
                 // Fecha o progress
                $scope.hideProgress(divPortletBodyImportacaoPos);
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyTitulosPos);
              });  
    }      
    
    
    
    // IMPORTA CSV
    /**
      * Retorna true se o upload está em curso
      */
    $scope.uploadEmProgresso = function(){
        return uploadEmProgresso;    
    }
    /**
      * Faz o upload
      */
    $scope.upload = function (files) {
        
        if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return; 
        
        
        if (files && files.length) {
            uploadEmProgresso = true;
            $scope.type = 'info';
            $scope.progresso = 0;
            // Loading progress
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyTitulosPos);
            // Pega o arquivo
            var file = files[0];
            // Avalia a extensão
            var index = file.name.lastIndexOf('.');
            if(index === -1 || file.name.toLowerCase().substr(index + 1) !== 'csv'){ 
                // Extensão não é CSV
                //console.log("ARQUIVO '" + file.name + "' NÃO É UM .csv");
                $scope.showAlert("O arquivo deve ser do tipo .csv!", true, 'warning', true, false);
                uploadEmProgresso = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyTitulosPos);
                return;
            }
            
            // Envia o arquivo
            //var url = $apis.getUrl($apis.card.tituloserp, $scope.token);
            var url = $apis.getUrl($apis.upload.upload, undefined, 
                                   [{id : 'token', valor: $scope.token}, 
                                    {id: 'tipo', valor : 100 /*card.upload.upload.titulo*/}]);
            // Seta para a url de download
            if(url.slice(0, "http://localhost:".length) !== "http://localhost:")
                url = url.replace($autenticacao.getUrlBase(), $autenticacao.getUrlBaseDownload());
            
            Upload.upload({
                url: url,
                file: file,
                method: 'POST',//'PATCH'
            }).success(function (data, status, headers, config) {
                $timeout(function() {
                    uploadEmProgresso = false;
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyTitulosPos);
                    $scope.showAlert('Importação concluída com sucesso!', true, 'success', true);
                });
            }).error(function (data, status, headers, config){
                 //console.log("erro");console.log(data);
                 if(status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 //else if(status === 503 || status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else if(status === 500) $scope.showModalAlerta(data);
                 else $scope.showAlert("Houve uma falha ao fazer upload do CSV '" + file.name + "' (" + status + ")", true, 'danger', true, false);
                // Remove o progress
                uploadEmProgresso = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyTitulosPos);
            });
        }
    };         
    
    $scope.importaCSV = function(){
        
        if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return; 
        
        console.log("importa csv");
        
    }
    
    
    
    $scope.avaliaNsu = function(){
        if(!$scope.filtro.nsu)
            $scope.filtro.consideraPeriodo = true;
    }
                       
    
    
}]);